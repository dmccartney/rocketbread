import { useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";

// This hook allows you to drop a file onto a component.
//
//       let {isOver, canDrop, dropRef} = useDroppedFile({
//          onFileLoaded: (file) => console.log(file)
//       });
//       return <div ref={dropRef}
//                   style={{color: isOver && canDrop ? "green" : "red"}}>
//                Drop a file here
//              </div>
//
export default function useDroppedFile({ onFileLoaded }) {
  const [state, dropRef] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      async drop(item) {
        if (item.files) {
          if (onFileLoaded) {
            onFileLoaded(item.files[0]);
          }
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    []
  );
  return { dropRef, ...state };
}
