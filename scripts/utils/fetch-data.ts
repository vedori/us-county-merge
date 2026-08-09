export const fetchData = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${response.status} status: Could not fetch ${url}`);
    }

    const result = await response.json();
    console.log(`Fetched ${url}`);
    return result;
  } catch (error: any) {
    console.error(`Error fetching ${url}`, error.message);
  }
};
