export function hexToRgb(hex: number) {
    return hexStrToRgb(hexNumToStr(hex))

    function hexNumToStr(num: number) {
        let str = num.toString(16)
        while (str.length < 6) str = '0' + str
        return '#' + str
    }

    function hexStrToRgb(hex: string) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }
}

export function rgbToHex(r: number, g: number, b: number) {
    return hexStrToNum(rgbToHexStr(Math.round(r), Math.round(g), Math.round(b)))

    function hexStrToNum(hex: string) {
        return parseInt("0x" + hex.slice(1))
    }

    function rgbToHexStr(r: number, g: number, b: number) {
        function componentToHex(c: number) {
            const hex = c.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }
}
