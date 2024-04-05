import React, { useState, useRef, useEffect } from "react";
import "./ImageLabeling.css";
import sampleImage from "../assets/sample.jpg";
import LabelingPanel, { toColor } from "./LabelingPanel";

const labels = ["Zero", "One", "Two", "Three", "Four", "Five"];

const image = new Image();
image.src = sampleImage;

function ImageLabeling() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [areas, setAreas] = useState([]);
  const [currentArea, setCurrentArea] = useState(null);

  useEffect(() => {
    canvasRef.current.width = canvasRef.current.getBoundingClientRect().width;
    canvasRef.current.height = canvasRef.current.getBoundingClientRect().height;
    setCanvas(canvasRef.current);
  }, [canvasRef]);

  const fill = (ctx, rect, index) => {
    const canvasWidth = canvas.getBoundingClientRect().width;
    const canvasHeight = canvas.getBoundingClientRect().height;
    const x = rect.x / canvasWidth * canvas.width;
    const y = rect.y / canvasHeight * canvas.height;
    const width = rect.width / canvasWidth * canvas.width;
    const height = rect.height / canvasHeight * canvas.height;
    console.log(canvasWidth, canvasHeight, canvas.width, canvas.height);
    ctx.fillStyle = toColor(rect.labelId);
    ctx.globalAlpha = 0.5;
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = toColor(rect.labelId);
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y + ctx.lineWidth / 2, width, height - ctx.lineWidth);
    const textHeight = 20 / canvasWidth * canvas.width;
    ctx.font = textHeight + "px consolas";
    ctx.fillStyle = "white";
    const centerX = x + width / 2, centerY = y + height / 2;
    const areaText = "区域" + (index + 1);
    const areaTextWidth = ctx.measureText(areaText).width;
    ctx.fillText(areaText, centerX - areaTextWidth / 2, centerY - textHeight / 4);
    const labelText = labels[rect.labelId];
    const labelTextWidth = ctx.measureText(labelText).width;
    ctx.fillText(labelText, centerX - labelTextWidth / 2, centerY + textHeight * 3 / 4);
  }

  useEffect(() => {
    if (!canvas || !areas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    areas.forEach((rect, index) => {
      fill(ctx, rect, index);
    });
    if (currentArea !== null)
      fill(ctx, currentArea, areas.length);
  }, [canvas, areas, currentArea]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentArea({x, y, labelId: 0});
    console.log("Mouse down, currentArea:", {x, y, labelId: 0});
  };

  const handleMouseMove = (e) => {
    if (!currentArea) return;
    console.log("mouse move");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = x - currentArea.x;
    const height = y - currentArea.y;
    setCurrentArea({...currentArea, width, height});
    console.log("Mouse move, currentArea:", currentArea);
  };

  const handleMouseUp = () => {
    console.log("Mouse up, currentArea:", currentArea);
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

  const convertAreas = (areas) => {
    const imageWidth = image.width, imageHeight = image.height;
    if (!canvas) return [];
    const rect = canvas.getBoundingClientRect();
    const canvasWidth = rect.width, canvasHeight = rect.height;
    const converted = areas.map(({x, y, width, height, labelId}) => ({
      x0: x / canvasWidth * imageWidth,
      y0: y / canvasHeight * imageHeight,
      x1: (x + width) / canvasWidth * imageWidth,
      y1: (y + height) / canvasHeight * imageHeight,
      labelId
    }));
    console.log("converted", converted);
    return converted;
  }

  return (
    <LabelingPanel
      dataType="image"
      data={
        <div className="img-container">
          <img src={sampleImage} alt="sample" />
          <canvas
            className="img-canvas"
            ref={canvasRef}
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
  );
}

export default ImageLabeling;
