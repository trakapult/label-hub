import { useEffect, useState } from "react";
import SegLabelingPanel, { getColor } from "./SegLabelingPanel";
import SaveButton from "./SaveButton";

const textLimit = 60;

function TextSegLabeling({sampleId, file, fileInfo, labelType, labelInfo, curLabelData, saveLabelData}) {
  const text = file;

  const labelDataToSegments = (labelData) => {
    const segments = [];
    if (!labelData) {
      segments.push({start: 0, end: fileInfo.length, label: null});
      return segments;
    }
    for (const segment of labelData) {
      const {start, end, label} = segment;
      if (segments.length === 0 && start > 0)
        segments.push({start: 0, end: start, label: null});
      if (segments.length > 0 && segments[segments.length - 1].end < start)
        segments.push({start: segments[segments.length - 1].end, end: start, label: null});
      segments.push({start, end, label});
    }
    const lastEnd = segments.length > 0 ? segments[segments.length - 1].end : 0;
    if (lastEnd < fileInfo.length)
      segments.push({start: lastEnd, end: fileInfo.length, label: null});
    return segments;
  };
  
  const segmentsToLabelData = (segments) => {
    return segments.filter((s) => s.label !== null && s.label !== "");
  };

  const [segments, setSegments] = useState([{start: 0, end: fileInfo.length, label: null}]);
  const [sortedSegments, setSortedSegments] = useState([{start: 0, end: fileInfo.length, label: null}]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    console.log("curLabelData", curLabelData);
    const s = labelDataToSegments(curLabelData);
    setSegments(s);
    setSortedSegments(s.slice().sort((a, b) => (a.start - b.start)));
    setSaved(curLabelData ? true : false);
  }, [sampleId]);

  const handleSegments = (start, end, label) => {
    const newSegments = [];
    let flag = false;
    for (const s of segments) {
      if (s.start === start && s.end === end) {
        newSegments.push({start, end, label});
        flag = true;
        continue;
      }
      if (s.start < start && start < s.end) {
        if (s.label === label) start = s.start;
        else newSegments.push({start: s.start, end: start, label: s.label});
      }
      if (s.start < end && end < s.end) {
        if (s.label === label) end = s.end;
        else newSegments.push({start: end, end: s.end, label: s.label});
      }
      if (end <= s.start || start >= s.end) {
        newSegments.push(s);
      }
    }
    if (!flag) newSegments.push({start, end, label});
    setSegments(newSegments);
    setSortedSegments(newSegments.slice().sort((a, b) => (a.start - b.start)));
  };

  const handleMouseUp = () => {
    const segment = window.getSelection();
    console.log(segment);
    const startIndex = segment.anchorNode.parentElement.getAttribute("index");
    const endIndex = segment.focusNode.parentElement.getAttribute("index");
    let start = sortedSegments[startIndex].start + segment.anchorOffset;
    let end = sortedSegments[endIndex].start + segment.focusOffset;
    console.log(start, end);
    if (start === end)
      return;
    if (start > end) {
      let temp = start;
      start = end;
      end = temp;
    }
    window.getSelection().removeAllRanges();
    handleSegments(start, end, "");
    setSaved(false);
  };

  const saveLabel = (index) => (value) => {
    const newSegment = {...segments[index], label: value};
    window.getSelection().removeAllRanges();
    handleSegments(newSegment.start, newSegment.end, newSegment.label);
    setSaved(false);
  };

  const handleAuxClick = (e) => {
    console.log("aux click", e);
    const newSegments = [...segments];
    for (let i = newSegments.length - 1; i >= 0; i--) {
      if (newSegments[i].label !== null) {
        newSegments[i].label = null;
        break;
      }
    }
    setSegments(newSegments);
    setSortedSegments(newSegments.slice().sort((a, b) => (a.start - b.start)));
    setSaved(false);
  }

  const getContent = (index) => {
    const segment = segments[index];
    const start = segment.start;
    const end = segment.end;
    if (end - start <= textLimit)
      return text.substring(start, end);
    else
      return text.substring(start, start + textLimit) + "...";
  }

  return (
    <form
      className="row text-center"
      onSubmit={(e) => {
        e.preventDefault();
        saveLabelData(segmentsToLabelData(sortedSegments));
        setSaved(true);
      }}
    >
      <SegLabelingPanel
        data={
          <p onMouseUp={handleMouseUp} onAuxClick={handleAuxClick} onContextMenu={(e) => e.preventDefault()}>
            {sortedSegments.map((s, index) => (
              <span
                index={index}
                key={index}
                style={{
                  backgroundColor: !s.label ? "white" : getColor(s.label, true),
                  border: s.label === null ? "" : "1px solid black"
                }}
              >
                {text.substring(s.start, s.end)}
              </span>
            ))}
          </p>
        }
        attrs={["区间", "内容"]}
        rows={
          segments.map((s, index) =>
            s.label === null ? null : [`[${s.start}, ${s.end})`, getContent(index)])
        }
        labelType={labelType}
        labelInfo={labelInfo}
        saveLabel={saveLabel}
        curLabelData={segments}
      />
      <SaveButton saved={saved} />
    </form>
  );
}

export default TextSegLabeling;