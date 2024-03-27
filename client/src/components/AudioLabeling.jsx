import React, { useState, useRef, useEffect } from 'react';
import './AudioLabeling.css';
import audio from '../assets/sample.mp3';
import LabelingPanel, {toColor} from './LabelingPanel';

const labels = ["Zero", "One", "Two", "Three", "Four", "Five"];
const canvasHeight = 200;
const margin = 10;
const chunkSize = 2000;

async function drawWave(wave, canvas) {
  const ctx = wave.getContext("2d");
  const {width, height} = wave;
  const centerHeight = Math.ceil(height / 2);
  const scaleFactor = height / 2;

  const buffer = await fetch(audio).then(response => response.arrayBuffer());
  const audioBuffer = await new AudioContext().decodeAudioData(buffer);
  const float32Array = audioBuffer.getChannelData(0);

  const array = [];
  for (let i = 0; i < float32Array.length; i += chunkSize) {
    array.push(
      float32Array.slice(i, i + chunkSize).reduce(function (total, value) {
        return Math.max(total, Math.abs(value));
      })
    );
  }
  wave.width = Math.ceil(float32Array.length / chunkSize + margin * 2);
  canvas.width = wave.width;
  for (let index in array) {
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(margin + Number(index), centerHeight - array[index] * scaleFactor);
    ctx.lineTo(margin + Number(index), centerHeight + array[index] * scaleFactor);
    ctx.stroke();
  }
}

let doScroll = true;
let mouseLeaveInterval = null;

function AudioLabeling() {
  const [progress, setProgress] = useState(0);
  const progressLineWidth = 2;
  const audioRef = useRef(null);
  const containerRef = useRef(null);
  const waveRef = useRef(null);
  const canvasRef = useRef(null);

  setInterval(() => {
    const audioElement = audioRef.current;
    const container = containerRef.current;
    const canvas = waveRef.current;
    if (!audioElement || !container || !canvas) return;
    const currentTime = audioElement.currentTime;
    const duration = audioElement.duration;
    const newProgress = (currentTime / duration) * canvas.width;
    setProgress(newProgress);
    if (doScroll)
      container.scrollLeft = newProgress - container.clientWidth / 2;
  }, 50);

  useEffect(() => {
    drawWave(waveRef.current, canvasRef.current);
  }, []);

  const [segments, setSegments] = useState([]);
  const [currentSegment, setCurrentSegment] = useState(null);
  const fill = (ctx, intv, index) => {
    const {start, end} = intv;
    ctx.fillStyle = toColor(intv.labelIdx);
    ctx.globalAlpha = 0.5;
    ctx.fillRect(start, 0, end - start, canvasRef.current.height);
    ctx.strokeStyle = toColor(intv.labelIdx);
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
    ctx.strokeRect(start, ctx.lineWidth / 2, end - start, canvasRef.current.height - ctx.lineWidth);
    const textHeight = 20;
    ctx.font = textHeight + 'px consolas';
    ctx.fillStyle = 'white';
    const centerX = (start + end) / 2, centerY = canvasRef.current.height / 2;
    const segmentText = '片段' + (index + 1);
    ctx.fillText(segmentText, centerX - ctx.measureText(segmentText).width / 2, centerY - textHeight / 4);
    const labelText = labels[intv.labelIdx];
    ctx.fillText(labelText, centerX - ctx.measureText(labelText).width / 2, centerY + textHeight * 3 / 4);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    segments.forEach((interval, index) => {
      fill(ctx, interval, index);
    });
    if (currentSegment !== null)
      fill(ctx, currentSegment, segments.length);
  }, [segments, currentSegment]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const canvas = canvasRef.current;
    const x = e.clientX - canvas.getBoundingClientRect().left;
    setCurrentSegment({start: x, end: x, labelIdx: 0});
  }

  const handleMouseMove = (e) => {
    if (!currentSegment) return;
    if (e.buttons !== 1) {
      handleMouseUp();
      return;
    }
    const canvas = canvasRef.current;
    const x = e.clientX - canvas.getBoundingClientRect().left;
    setCurrentSegment({...currentSegment, end: x});
  }

  const handleMouseUp = () => {
    if (!currentSegment) return;
    if (currentSegment.end < currentSegment.start) {
      const temp = currentSegment.start;
      currentSegment.start = currentSegment.end;
      currentSegment.end = temp;
    }
    console.log('Mouse up, currentSegment:', currentSegment);
    console.log('converted segments:', convertSegments([...segments, currentSegment]));
    if (currentSegment.end - currentSegment.start > 0)
      setSegments([...segments, currentSegment]);
    setCurrentSegment(null);
  }

  const handleMouseLeave = (e) => {
    if (e.buttons !== 1) {
      handleMouseOver();
      return;
    }
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const left = container.getBoundingClientRect().left, right = container.getBoundingClientRect().right;
    console.log("mouse leave", left, right, e.clientX);
    mouseLeaveInterval = setInterval(() => {
      if (e.clientX < left + margin) {
        container.scrollLeft -= 10;
        setCurrentSegment({...currentSegment, end: left - canvas.getBoundingClientRect().left});
      }
      if (e.clientX > right - margin) {
        container.scrollLeft += 10;
        setCurrentSegment({...currentSegment, end: right - canvas.getBoundingClientRect().left});
      }
    }, 50);
  }

  const handleMouseOver = () => {
    console.log("mouse over", mouseLeaveInterval);
    if (mouseLeaveInterval) {
      console.log('clear mouse leave interval');
      clearInterval(mouseLeaveInterval);
      mouseLeaveInterval = null;
    }
  }

  const handleAuxClick = (e) => {
    const newSegments = [...segments];
    newSegments.pop();
    setSegments(newSegments);
    setCurrentSegment(null);
  }

  const handleLabelChange = (index, event) => {
    const newSegments = [...segments];
    newSegments[index].labelIdx = parseInt(event.target.value);
    setSegments(newSegments);
  };

  const convertSegments = (segments) => {
    const converted = segments.map(({start, end, labelIdx}) => ({
      start: Math.max(0, (start - margin) / waveRef.current.width) * audioRef.current.duration,
      end: Math.min(1, (end - margin) / waveRef.current.width) * audioRef.current.duration,
      labelIdx
    }));
    return converted;
  }

  return (
    <>
      <LabelingPanel
        dataType='audio'
        data={
          <>
            <div
              className="audio-canvas-container"
              ref={containerRef}
              onMouseDown={() => {console.log(doScroll);doScroll = false}}
            >
              <canvas ref={waveRef} height={canvasHeight} />
              <div
                className="progress-line"
                style={{
                  width: progressLineWidth,
                  height: canvasHeight,
                  left: (isNaN(progress) ? 0 : progress) - progressLineWidth / 2 + margin
                }}
              />
              <canvas
                className="label-canvas"
                ref={canvasRef}
                height={canvasHeight}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onMouseOver={handleMouseOver}
                onAuxClick={handleAuxClick}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
            <audio controls src={audio} ref={audioRef}
              onPlay={() => doScroll = true}
              onPause={() => doScroll = false}
            >
              Your browser does not support the audio element.
            </audio>
          </>
        }
        attrs={["序号", "区间"]}
        rows={
          convertSegments(segments).map((s, index) =>[
            index + 1,
            `[${s.start.toFixed(2)}, ${s.end.toFixed(2)}]`
          ])
        }
        labels={labels}
        handleLabelChange={handleLabelChange}
        align={true}
      />
    </>
  );
};

export default AudioLabeling;