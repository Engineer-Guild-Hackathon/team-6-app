export const convertMinutesToHours = (minutes: number): string => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}時間${mins}分`;
}