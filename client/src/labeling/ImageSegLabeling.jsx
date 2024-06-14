import { useState, useRef, useEffect } from "react";
import "./Labeling.css";
import SegLabelingPanel, { getColor } from "./SegLabelingPanel";
import SaveButton from "./SaveButton";

const fontSize = 12;

function ImageSegLabeling({sampleId, file, fileInfo, labelType, labelInfo, curLabelData, saveLabelData}) {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [areas, setAreas] = useState([]);
  const [curArea, setCurArea] = useState(null);
  const [saved, setSaved] = useState(false);

  const labelDataToAreas = (labelData) => {
    if (!canvas || !labelData) return [];
    const imageWidth = fileInfo.width, imageHeight = fileInfo.height;
    const rect = canvas.getBoundingClientRect();
    const canvasWidth = rect.width, canvasHeight = rect.height;
    const areas = labelData.map(({x0, y0, x1, y1, label}) => ({
      x: x0 / imageWidth * canvasWidth,
      y: y0 / imageHeight * canvasHeight,
      width: (x1 - x0) / imageWidth * canvasWidth,
      height: (y1 - y0) / imageHeight * canvasHeight,
      label
    }));
    return areas;
  }

  const areasToLabelData = (areas) => {
    if (!canvas) return [];
    const imageWidth = fileInfo.width, imageHeight = fileInfo.height;
    const rect = canvas.getBoundingClientRect();
    const canvasWidth = rect.width, canvasHeight = rect.height;
    const labelData = areas.map(({x, y, width, height, label}) => ({
      x0: x / canvasWidth * imageWidth,
      y0: y / canvasHeight * imageHeight,
      x1: (x + width) / canvasWidth * imageWidth,
      y1: (y + height) / canvasHeight * imageHeight,
      label
    }));
    return labelData;
  }

  useEffect(() => {
    const a = labelDataToAreas(curLabelData);
    setAreas(a);
    fillAreas(a);
    setSaved(curLabelData ? true : false);
  }, [sampleId, fileInfo?.width, fileInfo?.height, curLabelData]);

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
    ctx.fillStyle = getColor(index);
    ctx.globalAlpha = 0.5;
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = getColor(index);
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y + ctx.lineWidth / 2, width, height - ctx.lineWidth);
    const textHeight = fontSize / canvasHeight * canvas.height;
    ctx.font = fontSize + "px arial";
    ctx.fillStyle = "white";
    const centerX = x + width / 2, centerY = y + height / 2;
    const areaText = index + 1;
    const areaTextWidth = ctx.measureText(areaText).width;
    ctx.fillText(areaText, centerX - areaTextWidth / 2, centerY - textHeight / 4);
    const labelText = rect.label === null ? "" : rect.label;
    const labelTextWidth = ctx.measureText(labelText).width;
    ctx.fillText(labelText, centerX - labelTextWidth / 2, centerY + textHeight * 3 / 4);
  }

  const fillAreas = (a) => {
    if (!canvas || !a) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    a.forEach((rect, index) => {
      if (rect) fill(ctx, rect, index);
    });
  }

  useEffect(() => {
    fillAreas([...areas, curArea]);
  }, [canvas, areas, curArea]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurArea({x, y, label: ""});
  };

  const handleMouseMove = (e) => {
    if (!curArea) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = x - curArea.x;
    const height = y - curArea.y;
    setCurArea({...curArea, width, height});
  };

  const handleMouseUp = () => {
    if (!curArea) return;
    if (curArea.width < 0) {
      curArea.x += curArea.width;
      curArea.width *= -1;
    }
    if (curArea.height < 0) {
      curArea.y += curArea.height;
      curArea.height *= -1;
    }
    if (curArea.width > 0 && curArea.height > 0)
      setAreas([...areas, curArea]);
    setCurArea(null);
    setSaved(false);
  };

  const handleAuxClick = () => {
    const newAreas = [...areas];
    newAreas.pop();
    setAreas(newAreas);
    setCurArea(null);
    setSaved(false);
  }

  const saveLabel = (index) => (value) => {
    const newAreas = [...areas];
    newAreas[index].label = value;
    setAreas(newAreas);
    setSaved(false);
  };

  return (
    <form
      className="row text-center"
      onSubmit={(e) => {
        e.preventDefault();
        saveLabelData(areasToLabelData(areas));
        setSaved(true);
      }}
    >
      <SegLabelingPanel
        data={
          <>
            <img src={`data:image;base64,${btoa(file)}`} alt="sample" />
            <canvas
              className="img-canvas"
              ref={canvasRef}
              width={1000}
              height={1000}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onAuxClick={handleAuxClick}
              onContextMenu={(e) => e.preventDefault()}
            />
          </>
        }
        attrs={["左上角", "右下角"]}
        rows={areasToLabelData(areas).map(({x0, y0, x1, y1, label}, index) =>[
          index + 1,
          `(${x0.toFixed(2)}, ${y0.toFixed(2)})`,
          `(${x1.toFixed(2)}, ${y1.toFixed(2)})`
        ])}
        labelType={labelType}
        labelInfo={labelInfo}
        saveLabel={saveLabel}
        curLabelData={areas}
      />
      <SaveButton saved={saved} />
    </form>
  );
}

export default ImageSegLabeling;