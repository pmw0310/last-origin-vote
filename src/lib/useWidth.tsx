import { useCallback, useEffect, useState } from 'react';

export default function useWidth(
    elementRef: React.RefObject<HTMLDivElement>,
): [number | null, () => void] {
    const [width, setWidth] = useState<number | null>(null);
    let interval: NodeJS.Timeout | number | undefined;

    const updateWidth = useCallback(() => {
        if (elementRef && elementRef?.current) {
            const { width } = elementRef?.current.getBoundingClientRect();
            setWidth(width);
        }
    }, [elementRef]);

    useEffect(() => {
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => {
            window.removeEventListener('resize', updateWidth);
        };
    }, [updateWidth]);

    interval = setInterval(() => {
        if (width === null) {
            updateWidth();
        } else {
            clearInterval(interval as NodeJS.Timeout);
            interval = undefined;
        }
    }, 10);

    return [width, updateWidth];
}
