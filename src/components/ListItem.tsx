/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
    Typography,
    IconButton,
    Chip,
    Avatar,
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Grid,
} from '@material-ui/core';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import styled from 'styled-components';
import { CharacterInterface, GroupInterface, LikeStats } from 'Module';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    ExpandMore as ExpandMoreIcon,
    MoreVert as MoreVertIcon,
    ThumbUpAlt as ThumbUpAltIcon,
    ThumbDownAlt as ThumbDownAltIcon,
    ThumbUpAltOutlined as ThumbUpAltOutlinedIcon,
    ThumbDownAltOutlined as ThumbDownAltOutlinedIcon,
} from '@material-ui/icons';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { currentUserVar } from '../lib/apollo';
import { useSnackbarState, FeedbackType } from '../components/Feedback';
import { webpVar } from '../lib/Webp';

type LikeData = {
    like: -1 | 0 | 1;
    likeStats: LikeStats;
};

export interface CharacterItemProps {
    data: CharacterInterface | GroupInterface;
    auth: boolean;
    removeDialogOpen: (id: string) => void;
    onLike?: (id: string, like: -1 | 1) => Promise<LikeStats>;
}

const Root = styled.div`
    margin: 12px;
    width: auto;
`;

const ItemAccordionSummary = styled(AccordionSummary)`
    align-items: flex-start !important;
`;

const Info = styled.div`
    display: flex;
    flex-direction: column;
    margin: 12px;
`;
const Auth = styled.div`
    position: absolute;
    top: 0;
    right: 52px;
`;
const TagChip = styled(Chip)`
    margin-right: 4px;
`;
const AuthButton = styled(IconButton)`
    background-color: transparent !important;
`;
const GradeIcon = styled.img`
    position: absolute;
    z-index: 100;
    top: 6px;
    left: 6px;
`;
const CharacterInfo = styled(Grid)`
    display: flex;
    align-items: center;
`;
const CharacterInfoChip = styled(Chip)`
    margin-right: 12px;
    width: 64px;
`;
const LikeButton = styled(IconButton)`
    width: 62px;
    height: 62px;
    .MuiIconButton-label {
        display: flex;
        flex-direction: column;
    }
    .MuiTypography-root {
        line-height: 1;
        padding-top: 3px;
    }
`;
const Like = styled.div`
    position: absolute;
    bottom: 6px;
    right: 6px;
`;

const ListItem: React.FC<CharacterItemProps> = ({
    data,
    auth,
    removeDialogOpen,
    onLike,
}): JSX.Element => {
    const [expanded, setExpanded] = useState<boolean>(false);
    const [likeData, setLikeData] = useState<LikeData>({
        like: data.like as -1 | 0 | 1,
        likeStats: { ...(data.likeStats as LikeStats) },
    });
    const [likeLoading, setLikeLoading] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const currentUser = currentUserVar();
    const dispatch = useSnackbarState();

    const handleChangeAccordion = (
        _event: React.ChangeEvent<any>,
        expanded: boolean,
    ): void => {
        if (open) return;
        setExpanded(expanded);
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLike = async (like: -1 | 1) => {
        if (!currentUser) {
            dispatch({
                type: FeedbackType.OPEN,
                option: {
                    measage: '로그인이 필요합니다.',
                    severity: 'warning',
                },
            });
            return;
        } else if (likeLoading || !onLike) {
            return;
        }

        setLikeLoading(true);

        try {
            const likeStats = await onLike(data.id as string, like);
            setLikeData({
                like: likeData.like === like ? 0 : like,
                likeStats,
            });
        } catch (e) {
            dispatch({
                type: FeedbackType.OPEN,
                option: {
                    measage: '작업이 실패하였습니다.',
                    severity: 'error',
                },
            });
        }

        setLikeLoading(false);
    };

    const router = useRouter();

    const isNone = (txt?: number): boolean => {
        return !txt;
    };

    const toRoleText = (): string => {
        const { charType, charRole } = data as CharacterInterface;
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

    const toGradeImagePaht = (grade: number, webp: boolean = false): string => {
        const { charRole } = data as CharacterInterface;

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

    const toStatureText = (): string => {
        const stature = (data as CharacterInterface).charStature as number;
        if (stature <= 0) {
            return '?cm';
        } else if (stature < 200) {
            return `${stature}cm`;
        } else {
            return `${stature / 100}m`;
        }
    };

    const toWeightText = (): string => {
        const weight = (data as CharacterInterface).charWeight as number;
        if (weight <= 0) {
            return '?kg';
        } else if (weight < 500) {
            return `${weight}kg`;
        } else {
            return `${weight / 1000}t`;
        }
    };

    const roleText = toRoleText();
    const gradeImage = toGradeImagePaht(
        (data as CharacterInterface).charGrade as number,
        webpVar(),
    );
    const statureText = toStatureText();
    const weightText = toWeightText();
    const type: 'CHARACTER' | 'GROUP' = data.type;

    return (
        <Root>
            <Accordion expanded={expanded} onChange={handleChangeAccordion}>
                <ItemAccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1c-content"
                    id="panel1c-header"
                >
                    {type === 'CHARACTER' && gradeImage && (
                        <GradeIcon
                            alt="grade"
                            src={gradeImage}
                            onError={(
                                e: React.SyntheticEvent<
                                    HTMLImageElement,
                                    Event
                                >,
                            ) => {
                                e.currentTarget.src =
                                    'https://via.placeholder.com/35x35.png?text=Error';
                            }}
                            height="35"
                        />
                    )}
                    <LazyLoadImage
                        alt="image"
                        src={
                            data.profileImage ||
                            'https://via.placeholder.com/150x150.png?text=No+Image'
                        }
                        onError={(
                            e: React.SyntheticEvent<HTMLImageElement, Event>,
                        ) => {
                            e.currentTarget.src =
                                'https://via.placeholder.com/150x150.png?text=Error';
                        }}
                        effect="blur"
                        width="150"
                        height="150"
                    />
                    <Info>
                        <Typography variant="h5" gutterBottom>
                            {data.name}
                        </Typography>
                        {type === 'CHARACTER' && roleText && (
                            <Typography variant="subtitle2" gutterBottom>
                                {roleText}
                            </Typography>
                        )}
                        <div>
                            {data.tag?.map((tag, index) => (
                                <TagChip
                                    variant="outlined"
                                    size="small"
                                    label={`#${tag}`}
                                    key={`${data.name}-${index}`}
                                />
                            ))}
                        </div>
                    </Info>
                    {auth && (
                        <Auth>
                            <AuthButton
                                aria-label="more"
                                aria-controls="auth-menu"
                                aria-haspopup="true"
                                onClick={handleMenuClick}
                                onFocus={(event) => event.stopPropagation()}
                            >
                                <MoreVertIcon />
                            </AuthButton>
                            <Menu
                                anchorEl={anchorEl}
                                keepMounted
                                open={open}
                                onClose={handleMenuClose}
                            >
                                <MenuItem
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleMenuClose();
                                        router.push(
                                            `/${type.toLowerCase()}/[id]`,
                                            `/${type.toLowerCase()}/${data.id}`,
                                        );
                                    }}
                                    onFocus={(event) => event.stopPropagation()}
                                >
                                    <ListItemIcon>
                                        <EditIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="편집" />
                                </MenuItem>
                                <MenuItem
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleMenuClose();
                                        removeDialogOpen(data.id as string);
                                    }}
                                    onFocus={(event) => event.stopPropagation()}
                                >
                                    <ListItemIcon>
                                        <DeleteIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="삭제" />
                                </MenuItem>
                            </Menu>
                        </Auth>
                    )}
                    <Like>
                        <LikeButton
                            onClick={(event) => {
                                event.stopPropagation();
                                handleLike(1);
                            }}
                            onFocus={(event) => event.stopPropagation()}
                        >
                            {likeData.like === 1 ? (
                                <ThumbUpAltIcon />
                            ) : (
                                <ThumbUpAltOutlinedIcon />
                            )}
                            <Typography variant="button">
                                {likeData.likeStats.like}
                            </Typography>
                        </LikeButton>
                        <LikeButton
                            onClick={(event) => {
                                event.stopPropagation();
                                handleLike(-1);
                            }}
                            onFocus={(event) => event.stopPropagation()}
                        >
                            {likeData.like === -1 ? (
                                <ThumbDownAltIcon />
                            ) : (
                                <ThumbDownAltOutlinedIcon />
                            )}
                            <Typography variant="button">
                                {likeData.likeStats.notLike}
                            </Typography>
                        </LikeButton>
                    </Like>
                </ItemAccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={1}>
                        {type === 'CHARACTER' && (
                            <>
                                {expanded &&
                                    (data as CharacterInterface).group && (
                                        <CharacterInfo
                                            item
                                            xl={12}
                                            lg={12}
                                            sm={12}
                                        >
                                            <Chip
                                                variant="outlined"
                                                color="primary"
                                                label="소속 부대"
                                            />
                                            <LazyLoadImage
                                                alt="https://via.placeholder.com/32x32.png?text=Error"
                                                src={
                                                    (data as CharacterInterface)
                                                        .group?.profileImage ||
                                                    'https://via.placeholder.com/32x32.png?text=None'
                                                }
                                                effect="blur"
                                                width="32"
                                                height="32"
                                            />
                                            <Typography variant="subtitle2">
                                                {
                                                    (data as CharacterInterface)
                                                        .group?.name
                                                }
                                            </Typography>
                                        </CharacterInfo>
                                    )}
                                <CharacterInfo item lg={3} sm={6}>
                                    <CharacterInfoChip
                                        variant="outlined"
                                        color="primary"
                                        label={
                                            (data as CharacterInterface)
                                                .charIsAgs
                                                ? '전고'
                                                : '신장'
                                        }
                                        size="small"
                                    />
                                    <Typography variant="subtitle2">
                                        {statureText}
                                    </Typography>
                                </CharacterInfo>
                                <CharacterInfo item lg={3} sm={6}>
                                    <CharacterInfoChip
                                        variant="outlined"
                                        color="primary"
                                        label={
                                            (data as CharacterInterface)
                                                .charIsAgs
                                                ? '중량'
                                                : '체중'
                                        }
                                        size="small"
                                    />
                                    <Typography variant="subtitle2">
                                        {weightText}
                                    </Typography>
                                </CharacterInfo>
                                {(data as CharacterInterface).charClass && (
                                    <CharacterInfo item lg={3} sm={6}>
                                        <CharacterInfoChip
                                            variant="outlined"
                                            color="primary"
                                            label="클래스"
                                            size="small"
                                        />
                                        <Typography variant="subtitle2">
                                            {
                                                (data as CharacterInterface)
                                                    .charClass
                                            }
                                        </Typography>
                                    </CharacterInfo>
                                )}
                                {(data as CharacterInterface).charArm && (
                                    <CharacterInfo item lg={3} sm={6}>
                                        <CharacterInfoChip
                                            variant="outlined"
                                            color="primary"
                                            label="무장"
                                            size="small"
                                        />
                                        <Typography variant="subtitle2">
                                            {
                                                (data as CharacterInterface)
                                                    .charArm
                                            }
                                        </Typography>
                                    </CharacterInfo>
                                )}
                            </>
                        )}
                        {type === 'GROUP' &&
                            expanded &&
                            ((data as GroupInterface).character as Array<
                                CharacterInterface
                            >)?.length > 0 && (
                                <CharacterInfo item xl={12}>
                                    <Chip
                                        variant="outlined"
                                        color="primary"
                                        label="소속 인원"
                                    />
                                    <AvatarGroup max={5}>
                                        {((data as GroupInterface)
                                            .character as Array<
                                            CharacterInterface
                                        >).map((char) => (
                                            <Avatar
                                                key={char.id}
                                                alt={char.name}
                                                src={char.profileImage}
                                            />
                                        ))}
                                    </AvatarGroup>
                                </CharacterInfo>
                            )}
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </Root>
    );
};

export default React.memo(ListItem);
