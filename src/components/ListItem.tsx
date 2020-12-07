/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Chip,
    Grid,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Typography,
} from '@material-ui/core';
import {
    CharacterInterface,
    GroupInterface,
    SkinInterface,
    Type,
} from '../module';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    ExpandMore as ExpandMoreIcon,
    MoreVert as MoreVertIcon,
} from '@material-ui/icons';
import React, { useState } from 'react';
import {
    toGradeImagePaht,
    toImage,
    toRoleText,
    toStatureText,
    toWeightText,
} from '../lib/info';

import Avatar from '../components/common/Avatar';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import Image from 'next/image';
import LikeButton from '../components/common/LikeButton';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import withWidth from '@material-ui/core/withWidth';

export interface ListItemProps {
    data: CharacterInterface | GroupInterface;
    auth: boolean;
    removeDialogOpen: (id: string) => void;
    width?: string;
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
    margin: 12px 0 12px 12px;
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
const GradeIcon = styled.div`
    position: absolute;
    z-index: 100;
    top: 6px;
    left: 6px;
    width: 60px;
    height: 36px;
`;
const ProfileImage = styled.div`
    width: 150px;
    height: 150px;
`;
const CharacterInfo = styled(Grid)`
    display: flex;
    align-items: center;
`;
const CharacterInfoChip = styled(Chip)`
    margin-right: 12px;
    width: 64px;
`;

const Like = styled.div`
    position: absolute;
    bottom: 6px;
    right: 6px;
`;

const ListItem: React.FC<ListItemProps> = ({
    data,
    auth,
    removeDialogOpen,
    width,
}): JSX.Element => {
    const [expanded, setExpanded] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

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

    const router = useRouter();

    const roleText = toRoleText(data);
    const gradeImage = toGradeImagePaht(
        data,
        (data as CharacterInterface).charGrade as number,
    );
    const statureText = toStatureText(data);
    const weightText = toWeightText(data);
    const type: Type = data.type as Type;

    return (
        <Root>
            <Accordion expanded={expanded} onChange={handleChangeAccordion}>
                <ItemAccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1c-content"
                    id="panel1c-header"
                >
                    {type === 'CHARACTER' && gradeImage && (
                        <GradeIcon>
                            <Image
                                alt="grade"
                                src={gradeImage}
                                layout="fill"
                                objectFit="contain"
                                objectPosition="left"
                                onError={(
                                    e: React.SyntheticEvent<
                                        HTMLImageElement,
                                        Event
                                    >,
                                ) => {
                                    const url =
                                        'https://via.placeholder.com/36x36.png?text=Error';
                                    e.currentTarget.decoding = 'sync';
                                    e.currentTarget.src = url;
                                    e.currentTarget.srcset = url;
                                }}
                            />
                        </GradeIcon>
                    )}
                    <ProfileImage>
                        <Image
                            alt="image"
                            src={
                                (toImage(data.profileImage) as string) ||
                                (toImage('/public/unknown.jpg') as string)
                            }
                            layout="fixed"
                            width={150}
                            height={150}
                            quality={90}
                            onError={(
                                e: React.SyntheticEvent<
                                    HTMLImageElement,
                                    Event
                                >,
                            ) => {
                                const url =
                                    'https://via.placeholder.com/150x150.png?text=Error';
                                e.currentTarget.decoding = 'sync';
                                e.currentTarget.src = url;
                                e.currentTarget.srcset = url;
                            }}
                        />
                    </ProfileImage>
                    <Info>
                        <Typography
                            variant={width === 'xs' ? 'h6' : 'h5'}
                            gutterBottom
                        >
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
                        <LikeButton id={data.id as string} showCount={true} />
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
                                            xs={12}
                                        >
                                            <Chip
                                                variant="outlined"
                                                color="primary"
                                                label="소속 부대"
                                            />
                                            <Avatar
                                                alt={
                                                    (data as CharacterInterface)
                                                        .group?.name as string
                                                }
                                                src={
                                                    (data as CharacterInterface)
                                                        .group
                                                        ?.profileImage as string
                                                }
                                                data={
                                                    (data as CharacterInterface)
                                                        .group
                                                }
                                                variant="square"
                                            />
                                            <Typography variant="subtitle2">
                                                {
                                                    (data as CharacterInterface)
                                                        .group?.name
                                                }
                                            </Typography>
                                        </CharacterInfo>
                                    )}
                                {expanded &&
                                    (data as CharacterInterface).skin &&
                                    ((data as CharacterInterface).skin as Array<
                                        SkinInterface
                                    >)?.length > 0 && (
                                        <CharacterInfo item xl={12} xs={12}>
                                            <Chip
                                                variant="outlined"
                                                color="primary"
                                                label="스킨"
                                            />
                                            <AvatarGroup
                                                max={width === 'xs' ? 5 : 10}
                                            >
                                                {((data as CharacterInterface)
                                                    .skin as Array<
                                                    SkinInterface
                                                >).map((skin) => (
                                                    <Avatar
                                                        key={skin.id}
                                                        alt="skin"
                                                        data={skin}
                                                        src={
                                                            skin.profileImage as string
                                                        }
                                                    />
                                                ))}
                                            </AvatarGroup>
                                        </CharacterInfo>
                                    )}
                                <CharacterInfo item lg={3} sm={6} xs={6}>
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
                                <CharacterInfo item lg={3} sm={6} xs={6}>
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
                                    <CharacterInfo item lg={3} sm={6} xs={6}>
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
                                    <CharacterInfo item lg={3} sm={6} xs={6}>
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
                            ((data as GroupInterface).member as Array<
                                CharacterInterface
                            >)?.length > 0 && (
                                <CharacterInfo item xl={12} xs={12}>
                                    <Chip
                                        variant="outlined"
                                        color="primary"
                                        label="소속 인원"
                                    />
                                    <AvatarGroup max={width === 'xs' ? 5 : 10}>
                                        {((data as GroupInterface)
                                            .member as Array<
                                            CharacterInterface
                                        >).map((char) => (
                                            <Avatar
                                                key={char.id}
                                                alt={char.name as string}
                                                data={char}
                                                src={
                                                    char.profileImage as string
                                                }
                                            />
                                        ))}
                                    </AvatarGroup>
                                </CharacterInfo>
                            )}
                        {type === 'SKIN' &&
                            expanded &&
                            (data as SkinInterface).character && (
                                <CharacterInfo item xl={12} xs={12}>
                                    <Chip
                                        variant="outlined"
                                        color="primary"
                                        label="착용"
                                    />
                                    <Avatar
                                        alt={
                                            (data as SkinInterface)?.character
                                                ?.name as string
                                        }
                                        src={
                                            (data as SkinInterface)?.character
                                                ?.profileImage as string
                                        }
                                        data={
                                            (data as SkinInterface)?.character
                                        }
                                    />
                                </CharacterInfo>
                            )}
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </Root>
    );
};

export default React.memo(withWidth()(ListItem));
