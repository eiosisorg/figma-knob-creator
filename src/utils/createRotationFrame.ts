export const createRotationFrame = (width: number, height: number, index: number, direction: 'vertical' | 'horizontal') => {
  const isHorizontal = direction === 'horizontal';
  const frame = figma.createFrame();
  frame.resize(1, 1);
  frame.x = isHorizontal ? index * width + width / 2 : width / 2;
  frame.y = isHorizontal ? height / 2 : index * height + height / 2;
  frame.clipsContent = false;
  frame.strokes = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }];
  frame.strokeWeight = 1;
  const fills = JSON.parse(JSON.stringify(frame.fills));
  fills[0].opacity = 0;
  frame.fills = fills;

  return frame;
}
