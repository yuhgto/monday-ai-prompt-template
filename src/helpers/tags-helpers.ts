function replaceSubstring(
    input: string,
    replacement: string,
    index: number,
    length: number
  ) {
    return (
      input.substring(0, index) + replacement + input.substring(index + length)
    );
  }
  
  function getNextTagPosition(input: string) {
    const findTagRegex = new RegExp("\\[\\[.*?\\]\\]");
    return input.match(findTagRegex);
  }
  
  function countNumberOfTags(input: string) {
    const findTagRegex = new RegExp("\\[\\[.*?\\]\\]", "g");
    return [...input.matchAll(findTagRegex)].length;
  }

  export function replaceTagsWithColumnValues(
    promptWithTags: string,
    columnValues: { id: string; text: string }[]
  ): string {
    // count number of tags
    const numberOfTagsToReplace = countNumberOfTags(promptWithTags);
  
    // flatten column values object
    const flatColumnValues: Record<string, string> = columnValues?.reduce(
      (prev, current) => {
        const { text, id } = current;
        return { [id]: text, ...prev };
      },
      {}
    );
  
    // set initial state
    let stringToReturn = promptWithTags;
  
    for (let tagNumber = 0; tagNumber < numberOfTagsToReplace; tagNumber++) {
      const nextTag = getNextTagPosition(stringToReturn);
      if (!nextTag) {
        continue;
      }
      const index = nextTag.index ?? 0;
      const length = nextTag[0].length;
      const columnId = JSON.parse(nextTag[0])[0][0].id;
  
      // filter columnValues for the specific column ID
      const valueToInsert = flatColumnValues[columnId];
  
      // Replace the tag with the column value
      stringToReturn = replaceSubstring(
        stringToReturn,
        valueToInsert,
        index,
        length
      );
    }
    return stringToReturn;
  }