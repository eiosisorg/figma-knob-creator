import {
  calculateDegrees,
  getCenteredValueEnd,
  getRangeEnd,
  getRangeStart,
  getValueEnd,
} from "./calculateDegrees";
import { createRotationFrame } from "./createRotationFrame";
import { getAction, hasCenter } from "./hasRotate";

export const createRotary = (nbSteps: number, nbDegrees: number, frameName: string, direction: 'vertical' | 'horizontal') => {
  const isVertical = direction === 'vertical';
  const { degreesStep, startDegrees } = calculateDegrees(nbSteps, nbDegrees);
  const frame = figma.currentPage.selection[0] as FrameNode;
  const group = frame.children[0] as GroupNode;
  const { width, height } = frame;

  if (isVertical) {
    frame.resizeWithoutConstraints(width, nbSteps * height);
  } else {
    const numRow = Math.ceil(Math.sqrt(nbSteps));
    const numCol = Math.floor(Math.sqrt(nbSteps));
    frame.resizeWithoutConstraints(numRow * width, numCol * height);
  }

  for (let i = 0; i < nbSteps; i++) {
    const rotationGroup = group.clone();
    rotationGroup.name = `${direction} ${i}`;

    rotationGroup.children.map((child, index) => {
      const xPos = isVertical ? child.x : child.x + (i * width);
      const yPos = isVertical ? child.y + (i * height) : child.y;

      switch (getAction(child.name)) {
        case 'rotate': {
          const rotationFrame = createRotationFrame(width, height, i, direction);
          rotationGroup.insertChild(index, rotationFrame);
          rotationFrame.appendChild(child);
          rotationFrame.name = child.name;
          child.y = child.y - (height / 2);
          child.x = child.x - (width / 2);
          rotationFrame.rotation = startDegrees - i * degreesStep;
          return rotationFrame;
        }

        case 'range': {
          const startingAngle = getRangeStart(nbDegrees);
          const endingAngle = getRangeEnd(startingAngle, nbDegrees);

          (child as EllipseNode).arcData = {
            ...(child as EllipseNode).arcData,
            startingAngle,
            endingAngle,
          }
          child.y = yPos
          child.x = xPos
          return child;
        }

        case 'value': {
          const center = hasCenter(child.name);
          const startingAngle = center ? Math.PI * 1.5 : getRangeStart(nbDegrees);
          const endingAngle = center
            ? getCenteredValueEnd(nbDegrees, degreesStep, i)
            : getValueEnd(startingAngle, degreesStep, i);

          (child as EllipseNode).arcData = {
            ...(child as EllipseNode).arcData,
            startingAngle,
            endingAngle,
          }
          child.y = yPos
          child.x = xPos
          return child;
        }

        default: {
          child.y = yPos
          child.x = xPos
          return child;
        }
      }
    })

    frame.insertChild(i + 1, rotationGroup);
  }
  group.remove();

  frame.layoutMode = isVertical ? "VERTICAL" : "HORIZONTAL";
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = "AUTO";
  frame.layoutWrap = isVertical ? "NO_WRAP" : "WRAP";

  const padding = 0;
  frame.itemSpacing = padding * 2; // Space between items (optional)
  frame.counterAxisSpacing = padding * 2;
  frame.paddingLeft = padding;
  frame.paddingRight = padding;
  frame.paddingTop = padding * 2;
  frame.paddingBottom = padding * 2;

  const numRow = Math.ceil(Math.sqrt(nbSteps));
  const numCol = Math.floor(Math.sqrt(nbSteps));
  //frame.resizeWithoutConstraints(numRow * width, numCol * height);
  frame.resize(numRow * width, numCol * height);

}
