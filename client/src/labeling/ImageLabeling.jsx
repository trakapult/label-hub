import React, { useState, useRef, useEffect } from "react";
import "./ImageLabeling.css";
import sampleImage from "../assets/sample.jpg";
import LabelingPanel, { toColor } from "./LabelingPanel";

const labels = ["Zero", "One", "Two", "Three", "Four", "Five"];
const canvasHeight = 450;
let canvasWidth = 0;

function ImageLabeling() {
  const canvasRef = useRef(null);
  const [areas, setAreas] = useState([]);
  const [currentArea, setCurrentArea] = useState(null);
  const fill = (ctx, rect, index) => {
    ctx.fillStyle = toColor(rect.labelId);
    ctx.globalAlpha = 0.5;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    ctx.strokeStyle = toColor(rect.labelId);
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
    ctx.strokeRect(rect.x, rect.y + ctx.lineWidth / 2, rect.width, rect.height - ctx.lineWidth);
    const textHeight = 20;
    ctx.font = textHeight + "px consolas";
    ctx.fillStyle = "white";
    const centerX = rect.x + rect.width / 2, centerY = rect.y + rect.height / 2;
    const areaText = "区域" + (index + 1);
    ctx.fillText(areaText, centerX - ctx.measureText(areaText).width / 2, centerY - textHeight / 4);
    const labelText = labels[rect.labelId];
    ctx.fillText(labelText, centerX - ctx.measureText(labelText).width / 2, centerY + textHeight * 3 / 4);
  }
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    areas.forEach((rect, index) => {
      fill(ctx, rect, index);
    });
    if (currentArea !== null)
      fill(ctx, currentArea, areas.length);
  }, [areas, currentArea]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentArea({x, y, labelId: 0});
    console.log("Mouse down, currentArea:", currentArea);
  };

  const handleMouseMove = (e) => {
    if (!currentArea) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = x - currentArea.x;
    const height = y - currentArea.y;
    setCurrentArea({...currentArea, width, height});
    console.log("Mouse move, currentArea:", currentArea);
  };

  const handleMouseUp = () => {
    if (!currentArea) return;
    if (currentArea.width < 0) {
      currentArea.x += currentArea.width;
      currentArea.width *= -1;
    }
    if (currentArea.height < 0) {
      currentArea.y += currentArea.height;
      currentArea.height *= -1;
    }
    if (currentArea.width > 0 && currentArea.height > 0)
      setAreas([...areas, currentArea]);
    setCurrentArea(null);
  };

  const handleAuxClick = (e) => {
    const newAreas = [...areas];
    newAreas.pop();
    setAreas(newAreas);
    setCurrentArea(null);
  }

  const handleLabelChange = (index, event) => {
    const newAreas = [...areas];
    newAreas[index].labelId = event.target.value;
    console.log("Rank change, newAreas:", newAreas);
    setAreas(newAreas);
  };

  const image = new Image();
  image.src = sampleImage;
  canvasWidth = canvasHeight / image.height * image.width;
  const convertAreas = (areas) => {
    const imageWidth = image.width, imageHeight = image.height;
    const converted = areas.map(({x, y, width, height, labelId}) => ({
      x0: x / canvasWidth * imageWidth,
      y0: y / canvasHeight * imageHeight,
      x1: (x + width) / canvasWidth * imageWidth,
      y1: (y + height) / canvasHeight * imageHeight,
      labelId
    }));
    return converted;
  }

  return (
    <>
      <h1>Image Labeling</h1>
      <LabelingPanel
        dataType="image"
        data={
          <div className="image-canvas-container" style={{height: canvasHeight}}>
            <img src={sampleImage} alt="Sample" />
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onAuxClick={handleAuxClick}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        }
        attrs={["序号", "左上角", "右下角"]}
        rows={convertAreas(areas).map(({x0, y0, x1, y1, labelId}, index) =>[
          index + 1,
          `(${x0.toFixed(2)}, ${y0.toFixed(2)})`,
          `(${x1.toFixed(2)}, ${y1.toFixed(2)})`
        ])}
        labels={labels}
        handleLabelChange={handleLabelChange}
      />
    </>
  );
}

export default ImageLabeling;
