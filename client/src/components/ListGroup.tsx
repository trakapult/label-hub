import { useState } from "react"

interface Props {
  heading: string
  items: string[]
  onSelectItem: (item: string) => void
}

function ListGroup(props: Props) {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const {heading, items, onSelectItem} = props
  return (<>
    <h1>{heading}</h1>
    {items.length === 0 && <p>No items to display</p>}
    <ul className="list-group">
      {items.map((item, index) =>
        <li className={index === selectedIndex ? "list-group-item active" : "list-group-item"}
          key={item}
          onMouseOver={() => setSelectedIndex(index)}
          onMouseOut={() => setSelectedIndex(-1)}
          onClick={() => onSelectItem(item)}>
            {item}
        </li>
      )}
    </ul>
  </>)
}

export default ListGroup