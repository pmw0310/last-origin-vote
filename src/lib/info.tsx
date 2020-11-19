import { CharacterInterface } from 'Module';

const isNone = (txt?: number): boolean => {
    return !txt;
};

export const toRoleText = ({
    charType,
    charRole,
}: CharacterInterface): string => {
    let text: string = '';

    const isType = !isNone(charType);
    const isRole = !isNone(charRole);

    if (!isType && !isRole) {
        return '';
    }

    switch (charType) {
        case 1:
            text += '경장';
            break;
        case 2:
            text += '기동';
            break;
        case 3:
            text += '중장';
            break;
    }

    text += isRole ? ' ' : '형';

    switch (charRole) {
        case 1:
            text += '공격기';
            break;
        case 2:
            text += '지원기';
            break;
        case 3:
            text += '보호기';
            break;
    }

    return text;
};

export const toGradeImagePaht = (
    { charRole }: CharacterInterface,
    grade: number,
    webp: boolean = false,
): string => {
    const isGrade = !isNone(grade);
    const isRole = !isNone(charRole);

    if (!isGrade || !isRole) {
        return '';
    }

    switch (charRole) {
        case 1:
            return `/public/a${grade}.${webp ? 'webp' : 'png'}`;
        case 2:
            return `/public/s${grade}.${webp ? 'webp' : 'png'}`;
        case 3:
            return `/public/d${grade}.${webp ? 'webp' : 'png'}`;
        default:
            return '';
    }
};

export const toStatureText = ({ charStature }: CharacterInterface): string => {
    const stature = charStature as number;
    if (stature <= 0) {
        return '?cm';
    } else if (stature < 200) {
        return `${stature}cm`;
    } else {
        return `${stature / 100}m`;
    }
};

export const toWeightText = ({ charWeight }: CharacterInterface): string => {
    const weight = charWeight as number;
    if (weight <= 0) {
        return '?kg';
    } else if (weight < 500) {
        return `${weight}kg`;
    } else {
        return `${weight / 1000}t`;
    }
};

export const toProfileImage = (
    profileImage: string | undefined,
    webp: boolean = false,
): string | undefined => {
    if (profileImage && webp) {
        profileImage = profileImage
            .replace(/.png$/, '.webp')
            .replace(/.jpg$/, '.webp');
    }
    return profileImage;
};
