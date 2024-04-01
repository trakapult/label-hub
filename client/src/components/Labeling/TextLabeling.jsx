import { useState } from "react";
import "./TextLabeling.module.css";
import LabelingPanel, { toColor } from "./LabelingPanel";

const labels = ["Zero", "One", "Two", "Three", "Four", "Five"];

function TextLabeling() {
  const [text, setText] = useState("哇哇哇哇哇哇哇哇哇Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sit amet sapien quis justo scelerisque varius. Phasellus fringilla velit sit amet erat euismod, a efficitur magna luctus. Vivamus commodo velit eu urna gravida, eget fringilla nisl fermentum. Proin interdum justo et eros pharetra tincidunt. Donec in ipsum semper, varius felis sed, ultricies quam. Nulla tincidunt lorem id lectus suscipit, vel feugiat lectus tincidunt. Duis sit amet efficitur purus. Phasellus eget nulla id justo fringilla tempus.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sit amet sapien quis justo scelerisque varius. Phasellus fringilla velit sit amet erat euismod, a efficitur magna luctus. Vivamus commodo velit eu urna gravida, eget fringilla nisl fermentum. Proin interdum justo et eros pharetra tincidunt. Donec in ipsum semper, varius felis sed, ultricies quam. Nulla tincidunt lorem id lectus suscipit, vel feugiat lectus tincidunt. Duis sit amet efficitur purus. Phasellus eget nulla id justo fringilla tempus.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sit amet sapien quis justo scelerisque varius. Phasellus fringilla velit sit amet erat euismod, a efficitur magna luctus. Vivamus commodo velit eu urna gravida, eget fringilla nisl fermentum. Proin interdum justo et eros pharetra tincidunt. Donec in ipsum semper, varius felis sed, ultricies quam. Nulla tincidunt lorem id lectus suscipit, vel feugiat lectus tincidunt. Duis sit amet efficitur purus. Phasellus eget nulla id justo fringilla tempus.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sit amet sapien quis justo scelerisque varius. Phasellus fringilla velit sit amet erat euismod, a efficitur magna luctus. Vivamus commodo velit eu urna gravida, eget fringilla nisl fermentum. Proin interdum justo et eros pharetra tincidunt. Donec in ipsum semper, varius felis sed, ultricies quam. Nulla tincidunt lorem id lectus suscipit, vel feugiat lectus tincidunt. Duis sit amet efficitur purus. Phasellus eget nulla id justo fringilla tempus.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sit amet sapien quis justo scelerisque varius. Phasellus fringilla velit sit amet erat euismod, a efficitur magna luctus. Vivamus commodo velit eu urna gravida, eget fringilla nisl fermentum. Proin interdum justo et eros pharetra tincidunt. Donec in ipsum semper, varius felis sed, ultricies quam. Nulla tincidunt lorem id lectus suscipit, vel feugiat lectus tincidunt. Duis sit amet efficitur purus. Phasellus eget nulla id justo fringilla tempus.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sit amet sapien quis justo scelerisque varius. Phasellus fringilla velit sit amet erat euismod, a efficitur magna luctus. Vivamus commodo velit eu urna gravida, eget fringilla nisl fermentum. Proin interdum justo et eros pharetra tincidunt. Donec in ipsum semper, varius felis sed, ultricies quam. Nulla tincidunt lorem id lectus suscipit, vel feugiat lectus tincidunt. Duis sit amet efficitur purus. Phasellus eget nulla id justo fringilla tempus.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sit amet sapien quis justo scelerisque varius. Phasellus fringilla velit sit amet erat euismod, a efficitur magna luctus. Vivamus commodo velit eu urna gravida, eget fringilla nisl fermentum. Proin interdum justo et eros pharetra tincidunt. Donec in ipsum semper, varius felis sed, ultricies quam. Nulla tincidunt lorem id lectus suscipit, vel feugiat lectus tincidunt. Duis sit amet efficitur purus. Phasellus eget nulla id justo fringilla tempus.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sit amet sapien quis justo scelerisque varius. Phasellus fringilla velit sit amet erat euismod, a efficitur magna luctus. Vivamus commodo velit eu urna gravida, eget fringilla nisl fermentum. Proin interdum justo et eros pharetra tincidunt. Donec in ipsum semper, varius felis sed, ultricies quam. Nulla tincidunt lorem id lectus suscipit, vel feugiat lectus tincidunt. Duis sit amet efficitur purus. Phasellus eget nulla id justo fringilla tempus.");
  const [segments, setSegments] = useState([{ start: 0, end: text.length, labelId: null}]);
  const [sortedSegments, setSortedSegments] = useState([{ start: 0, end: text.length, labelId: null}]);

  const handleSegments = (start, end, labelId) => {
    const newSegments = [];
    for (const s of segments) {
      if (s.start < start && start < s.end) {
        if (s.labelId === labelId) {
          start = s.start;
        } else {
          newSegments.push({start: s.start, end: start, labelId: s.labelId});
        }
      }
      if (s.start < end && end < s.end) {
        if (s.labelId === labelId) {
          end = s.end;
        } else {
          newSegments.push({start: end, end: s.end, labelId: s.labelId});
        }
      }
      if (end <= s.start || start >= s.end) {
        newSegments.push(s);
      }
    }
    newSegments.push({start, end, labelId});
    console.log(newSegments.length);
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
    if (start === end) return;
    if (start > end) {
      let temp = start;
      start = end;
      end = temp;
    }
    window.getSelection().removeAllRanges();
    handleSegments(start, end, -1);
  };

  const handleLabelChange = (index, e) => {
    const newSegment = {...segments[index], labelId: parseInt(e.target.value)};
    window.getSelection().removeAllRanges();
    handleSegments(newSegment.start, newSegment.end, newSegment.labelId);
  };

  const handleAuxClick = (e) => {
    console.log("aux click", e);
    const newSegments = [...segments];
    for (let i = newSegments.length - 1; i >= 0; i--) {
      if (newSegments[i].labelId !== null) {
        newSegments[i].labelId = null;
        break;
      }
    }
    setSegments(newSegments);
    setSortedSegments(newSegments.slice().sort((a, b) => (a.start - b.start)));
  }

  const getContent = (index) => {
    const segment = segments[index];
    const start = segment.start;
    const end = segment.end;
    if (end - start <= 20)
      return text.substring(start, end);
    else
      return text.substring(start, start + 20) + "...";
  }

  return (
    <>
      <h1>Text Labeling App</h1>
      <LabelingPanel
        dataType="text"
        data={
          <p onMouseUp={handleMouseUp} onAuxClick={handleAuxClick} onContextMenu={(e) => e.preventDefault()}>
            {sortedSegments.map((s, index) => (
              <span
                index={index}
                key={index}
                style={{
                  backgroundColor: s.labelId === null ? "white" : toColor(s.labelId, true),
                  border: s.labelId === null ? "" : "1px solid black"
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
            s.labelId === null ? null : ["[" + s.start + ", " + s.end + ")", getContent(index)])
        }
        labels={labels}
        handleLabelChange={handleLabelChange}
      />
    </>
  );
}

export default TextLabeling;
