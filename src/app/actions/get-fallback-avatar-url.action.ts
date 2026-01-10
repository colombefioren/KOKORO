export const getFallbackAvatarUrlAction = (
  firstName: string,
  lastName: string
) => {
  const fullName = encodeURIComponent(`${firstName} ${lastName}`);
  return `https://ui-avatars.com/api/?name=${fullName}&background=random&size=128`;
};
