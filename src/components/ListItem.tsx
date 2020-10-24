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
} from '@material-ui/core';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import styled from 'styled-components';
import { CharacterInterface, GroupInterface } from 'Module';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    ExpandMore as ExpandMoreIcon,
    MoreVert as MoreVertIcon,
} from '@material-ui/icons';
import { LazyLoadImage } from 'react-lazy-load-image-component';

export interface CharacterItemProps {
    data: CharacterInterface | GroupInterface;
    auth: boolean;
    removeDialogOpen: (id: string) => void;
    type: 'char' | 'group';
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
`;

const ListItem: React.FC<CharacterItemProps> = ({
    data,
    auth,
    removeDialogOpen,
    type,
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

    const isNone = (txt?: string): boolean => {
        return !txt || txt === 'NONE';
    };

    const toRoleText = (): string => {
        const { type, role } = data as CharacterInterface;
        let text: string = '';

        const isType = !isNone(type);
        const isRole = !isNone(role);

        if (!isType && !isRole) {
            return '';
        }

        switch (type) {
            case 'LIGHT':
                text += '경장';
                break;
            case 'FLYING':
                text += '기동';
                break;
            case 'HEAVY':
                text += '중장';
                break;
        }

        text += isRole ? ' ' : '형';

        switch (role) {
            case 'ASSAULT':
                text += '공격기';
                break;
            case 'SUPPORT':
                text += '지원기';
                break;
            case 'DEFENDER':
                text += '보호기';
                break;
        }

        return text;
    };

    const toGradeImage = (grade: string): string => {
        const { role } = data as CharacterInterface;

        const isGrade = !isNone(grade);
        const isRole = !isNone(role);

        if (!isGrade || !isRole) {
            return '';
        }

        switch (role) {
            case 'ASSAULT':
                return `/a${grade.toLocaleLowerCase()}.png`;
            case 'SUPPORT':
                return `/s${grade.toLocaleLowerCase()}.png`;
            case 'DEFENDER':
                return `/d${grade.toLocaleLowerCase()}.png`;
            default:
                return '';
        }
    };

    const roleText = toRoleText();
    const gradeImage = toGradeImage(
        (data as CharacterInterface).grade as string,
    );

    return (
        <Root>
            <Accordion expanded={expanded} onChange={handleChangeAccordion}>
                <ItemAccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1c-content"
                    id="panel1c-header"
                >
                    {type === 'char' && gradeImage && (
                        <GradeIcon
                            alt="https://via.placeholder.com/150x150.png?text=Error"
                            src={gradeImage}
                            height="35"
                        />
                    )}
                    <LazyLoadImage
                        alt="https://via.placeholder.com/150x150.png?text=Error"
                        src={
                            (data as CharacterInterface).profileImage ||
                            (data as GroupInterface).image ||
                            'https://via.placeholder.com/150x150.png?text=No+Image'
                        }
                        effect="blur"
                        width="150"
                        height="150"
                    />
                    <Info>
                        <Typography variant="h5" gutterBottom>
                            {data.name}
                        </Typography>
                        {type === 'char' && roleText && (
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
                                            `/${type}/[id]`,
                                            `/${type}/${data.id}`,
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
                </ItemAccordionSummary>
                <AccordionDetails>
                    {type === 'group' &&
                        expanded &&
                        ((data as GroupInterface).character as Array<
                            CharacterInterface
                        >)?.length > 0 && (
                            <AvatarGroup max={5}>
                                {((data as GroupInterface).character as Array<
                                    CharacterInterface
                                >).map((char) => (
                                    <Avatar
                                        key={char.id}
                                        alt={char.name}
                                        src={char.profileImage}
                                    />
                                ))}
                            </AvatarGroup>
                        )}
                </AccordionDetails>
            </Accordion>
        </Root>
    );
};

export default ListItem;
