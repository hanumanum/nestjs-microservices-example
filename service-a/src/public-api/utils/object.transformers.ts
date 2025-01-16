import { TAPIResponseEntry, TNewDBRecord } from '../types';

const extractIngiridentsAndMesurments = (
  entry: TAPIResponseEntry,
): [string[], string[]] => {
  const ingridients = [];
  const mesurments = [];

  //INFO: 20 is the maximum number of ingridients and mesurments according to the API
  for (let i = 1; i <= 20; i++) {
    const ingridientKey = `strIngredient${i}`;
    const mesurmentKey = `strMeasure${i}`;

    if (!entry[ingridientKey]) {
      break;
    }

    ingridients.push(entry[ingridientKey]);
    mesurments.push(entry[mesurmentKey]);
  }

  return [ingridients, mesurments];
};

export const externalApiEntryToRecord =
  (query: string) =>
  (entry: TAPIResponseEntry): TNewDBRecord => {
    const [ingridients, mesurments] = extractIngiridentsAndMesurments(entry);

    return {
      query: query,
      originalId: entry.idMeal,
      title: entry.strMeal,
      cagetory: entry.strCategory,
      area: entry.strArea,
      instructions: entry.strInstructions,
      ingridients: ingridients,
      mesurments: mesurments,
      originalSourceURI: entry.strYoutube,
      timestamp: new Date(),
    } as TNewDBRecord;
  };
