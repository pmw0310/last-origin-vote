/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Chip,
    Grid,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Typography,
} from '@material-ui/core';
import { CharacterInterface, GroupInterface } from 'Module';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    ExpandMore as ExpandMoreIcon,
    MoreVert as MoreVertIcon,
} from '@material-ui/icons';
import React, { useState } from 'react';
import {
    toGradeImagePaht,
    toProfileImage,
    toRoleText,
    toStatureText,
    toWeightText,
} from '../lib/info';

import AvatarGroup from '@material-ui/lab/AvatarGroup';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import LikeButton from '../components/common/LikeButton';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { webpVar } from '../lib/Webp';
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

    const webp = webpVar();
    const roleText = toRoleText(data);
    const gradeImage = toGradeImagePaht(
        data,
        (data as CharacterInterface).charGrade as number,
        webp,
    );
    const statureText = toStatureText(data);
    const weightText = toWeightText(data);
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
                            toProfileImage(data.profileImage, webp) ||
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
                                            <LazyLoadImage
                                                alt="https://via.placeholder.com/32x32.png?text=Error"
                                                src={
                                                    toProfileImage(
                                                        (data as CharacterInterface)
                                                            .group
                                                            ?.profileImage,
                                                        webp,
                                                    ) ||
                                                    'https://via.placeholder.com/32x32.png?text=None'
                                                }
                                                effect="blur"
                                                width="32"
                                                height="32"
                                                onError={(
                                                    e: React.SyntheticEvent<
                                                        HTMLImageElement,
                                                        Event
                                                    >,
                                                ) => {
                                                    e.currentTarget.src =
                                                        'https://via.placeholder.com/35x35.png?text=Error';
                                                }}
                                            />
                                            <Typography variant="subtitle2">
                                                {
                                                    (data as CharacterInterface)
                                                        .group?.name
                                                }
                                            </Typography>
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
                            ((data as GroupInterface).character as Array<
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
                                            .character as Array<
                                            CharacterInterface
                                        >).map((char) => (
                                            <Avatar
                                                key={char.id}
                                                alt={char.name}
                                                src={toProfileImage(
                                                    char.profileImage,
                                                    webp,
                                                )}
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

export default React.memo(withWidth()(ListItem));
