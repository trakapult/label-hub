import { useState, useRef, useEffect } from "react";
import "./Labeling.css";
import SegLabelingPanel, { getColor } from "./SegLabelingPanel";
import SaveButton from "./SaveButton";

const canvasHeight = 200;
const margin = 10;
const chunkSize = 2000;
const progressLineWidth = 2;
const fontSize = 12;

async function drawWave(audio, wave, canvas) {
  const ctx = wave.getContext("2d");
  const {height} = wave;
  const centerHeight = Math.ceil(height / 2);
  const scaleFactor = height / 2;

  const buffer = await fetch(`data:audio/wav;base64,${btoa(audio)}`).then((res) => res.arrayBuffer());
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
  ctx.clearRect(0, 0, wave.width, wave.height);
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

function AudioSegLabeling({sampleId, file, fileInfo, labelType, labelInfo, curLabelData, saveLabelData}) {
  const audioRef = useRef(null);
  const containerRef = useRef(null);
  const waveRef = useRef(null);
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [progress, setProgress] = useState(0);
  const [segments, setSegments] = useState([]);
  const [curSegment, setCurSegment] = useState(null);
  const [saved, setSaved] = useState(false);

  const labelDataToSegments = (labelData) => {
    if (!canvas || !labelData || !audioRef) return [];
    const duration = fileInfo.duration;
    const canvasWidth = canvas.getBoundingClientRect().width;
    const segments = labelData.map(({start, end, label}) => ({
      start: start / duration * canvasWidth + margin,
      end: end / duration * canvasWidth + margin,
      label
    }));
    return segments;
  }

  const segmentsToLabelData = (segments) => {
    if (!canvas || !audioRef) return [];
    const duration = fileInfo.duration;
    const canvasWidth = canvas.getBoundingClientRect().width;
    const labelData = segments.map(({start, end, label}) => ({
      start: Math.max((start - margin) / canvasWidth * duration, 0),
      end: Math.min((end - margin) / canvasWidth * duration, duration),
      label
    }));
    return labelData;
  }

  useEffect(() => {
    drawWave(file, waveRef.current, canvasRef.current);
    setCanvas(canvasRef.current);
  }, [file]);

  useEffect(() => {
    const s = labelDataToSegments(curLabelData);
    setSegments(s);
    fillSegments(s);
    setSaved(curLabelData ? true : false);
  }, [sampleId, fileInfo?.duration, curLabelData, canvas?.width]);

  setInterval(() => {
    const audioElement = audioRef.current;
    const container = containerRef.current;
    const canvas = waveRef.current;
    if (!audioElement || !container || !canvas) return;
    const currentTime = audioElement.currentTime;
    const duration = audioElement.duration;
    const newProgress = (currentTime / duration) * (canvas.width - margin * 2);
    setProgress(newProgress);
    if (doScroll)
      container.scrollLeft = newProgress - container.clientWidth / 2;
  }, 50);

  const fill = (ctx, intv, index) => {
    const {start, end} = intv;
    const canvasHeight = canvas.getBoundingClientRect().height;
    ctx.fillStyle = getColor(index);
    ctx.globalAlpha = 0.5;
    ctx.fillRect(start, 0, end - start, canvas.height);
    ctx.strokeStyle = getColor(index);
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
    ctx.strokeRect(start, ctx.lineWidth / 2, end - start, canvas.height - ctx.lineWidth);
    const textHeight = fontSize / canvasHeight * canvas.height;
    ctx.font = fontSize + "px arial";
    ctx.fillStyle = "white";
    const centerX = (start + end) / 2, centerY = canvas.height / 2;
    const segmentText = index + 1;
    ctx.fillText(segmentText, centerX - ctx.measureText(segmentText).width / 2, centerY - textHeight / 4);
    const labelText = intv.label === null ? "" : intv.label;
    ctx.fillText(labelText, centerX - ctx.measureText(labelText).width / 2, centerY + textHeight * 3 / 4);
  }

  const fillSegments = (s) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    s.forEach((intv, index) => {
      if (intv) fill(ctx, intv, index);
    });
  }

  useEffect(() => {
    fillSegments([...segments, curSegment]);
  }, [canvas, segments, curSegment]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const x = e.clientX - canvas.getBoundingClientRect().left;
    setCurSegment({start: x, end: x, label: null});
  }

  const handleMouseMove = (e) => {
    if (!curSegment) return;
    if (e.buttons !== 1) {
      handleMouseUp();
      return;
    }
    const x = e.clientX - canvas.getBoundingClientRect().left;
    setCurSegment({...curSegment, end: x});
  }

  const handleMouseUp = () => {
    if (!curSegment) return;
    if (curSegment.end < curSegment.start) {
      const temp = curSegment.start;
      curSegment.start = curSegment.end;
      curSegment.end = temp;
    }
    if (curSegment.end - curSegment.start > 0)
      setSegments([...segments, curSegment]);
    setCurSegment(null);
    setSaved(false);
  }

  const handleMouseLeave = (e) => {
    if (e.buttons !== 1) {
      handleMouseOver();
      return;
    }
    const container = containerRef.current;
    const left = container.getBoundingClientRect().left, right = container.getBoundingClientRect().right;
    mouseLeaveInterval = setInterval(() => {
      if (e.clientX < left + margin) {
        container.scrollLeft -= 10;
        setCurSegment({...curSegment, end: left - canvas.getBoundingClientRect().left});
      }
      if (e.clientX > right - margin) {
        container.scrollLeft += 10;
        setCurSegment({...curSegment, end: right - canvas.getBoundingClientRect().left});
      }
    }, 50);
  }

  const handleMouseOver = () => {
    if (mouseLeaveInterval) {
      clearInterval(mouseLeaveInterval);
      mouseLeaveInterval = null;
    }
  }

  const handleAuxClick = () => {
    const newSegments = [...segments];
    newSegments.pop();
    setSegments(newSegments);
    setCurSegment(null);
    setSaved(false);
  }

  const saveLabel = (index) => (value) => {
    const newSegments = [...segments];
    newSegments[index].label = value;
    setSegments(newSegments);
    setSaved(false);
  };

  return (
    <form
      className="row text-center"
      onSubmit={(e) => {
        e.preventDefault();
        saveLabelData(segmentsToLabelData(segments));
        setSaved(true);
      }}
    >
      <SegLabelingPanel
        data={
          <>
            <div
              className="audio-container"
              ref={containerRef}
              onMouseDown={() => {doScroll = false;}}
            >
              <canvas className="audio-canvas" ref={waveRef} height={canvasHeight} />
              <div
                className="progress-line"
                style={{
                  width: progressLineWidth,
                  height: canvasHeight,
                  left: (isNaN(progress) ? 0 : progress) - progressLineWidth / 2 + margin
                }}
              />
              <canvas
                className="audio-canvas label-canvas"
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
            <audio controls src={`data:audio/wav;base64,${btoa(file)}`} ref={audioRef}
              onPlay={() => doScroll = true}
              onPause={() => doScroll = false}
            >
              您的浏览器不支持音频播放。
            </audio>
          </>
        }
        attrs={["区间"]}
        rows={
          segmentsToLabelData(segments).map((s, index) =>[
            index + 1,
            `[${s.start.toFixed(2)}, ${s.end.toFixed(2)}]`
          ])
        }
        labelType={labelType}
        labelInfo={labelInfo}
        saveLabel={saveLabel}
        curLabelData={segments}
      />
      <SaveButton saved={saved} />
    </form>
  );
};

export default AudioSegLabeling;