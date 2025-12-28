export class NameHelper {
    static getNewUniqueName(expectedName: string, existingNames: string[]): string {
        // match: name + optional number at the end
        const match = expectedName.match(/^(.*?)(\d+)?$/);

        const baseName = match?.[1] ?? expectedName;
        let index = match?.[2] ? parseInt(match[2], 10) : 0;

        while (true) {
            const candidate =
                index === 0 ? baseName : `${baseName}${index}`;

            if (!existingNames.includes(candidate)) {
                return candidate;
            }

            index++;
        }
    }

}
