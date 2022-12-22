import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);

  const addMoveable = () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true,
      },
    ]);
  };

  const removeMoveable = (e, id) => {
    e.preventDefault();
    let newArr = moveableComponents.filter((mvble) => mvble.id !== id);
    setMoveableComponents(newArr);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  return (
    <main>
      <button onClick={addMoveable}>Add Moveable</button>
      <p>Para eliminar un elemento haga click secundario en él</p>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            setSelected={setSelected}
            isSelected={selected === item.id}
            handleRemoveMoveable={removeMoveable}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  handleRemoveMoveable,
  updateEnd,
}) => {
  const ref = useRef();
  const [background, setBackground] = useState("");

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/photos")
      .then((response) => response.json())
      .then((values) => {
        setBackground(values[Math.floor(Math.random() * (4999 - 1) + 1)].url);
      });
  }, []);

  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;
    const beforeTranslate = e.drag.beforeTranslate;

    const positionMaxTop = e.top + newHeight;
    const positionMaxLeft = e.left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - e.top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - e.left;

    updateMoveable(id, {
      top: e.top,
      left: e.left,
      width: newWidth,
      height: newHeight,
      color,
    });

    // ACTUALIZAR NODO REFERENCIA

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: e.top,
      left: e.left,
    });
  };

  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    /*  const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left; */

    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;

    const absoluteTop = top + beforeTranslate[1];
    const absoluteLeft = left + beforeTranslate[0];

    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        color,
      },
      true
    );
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          background: color,
        }}
        onClick={() => setSelected(id)}
        onContextMenu={(e) => handleRemoveMoveable(e, id)}
      >
        <img alt="" width="100%" height="100%" src={background} />
      </div>

      <Moveable
        target={isSelected && ref.current}
        container={parent}
        resizable
        draggable
        onDrag={({ target, transform }) => {
          target.style.transform = transform;
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={true}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
