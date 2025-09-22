export const changeImageAction = (image: string) => {
  return {
    type: "CHANGE_IMAGE",
    payload: image,
  };
};
