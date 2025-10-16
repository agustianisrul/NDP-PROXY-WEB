import db from '../config/client';

export const getAllMenuRolesQuery = () => {
    return db
        .select(
            'men.idMenu',
            'men.nameMenu',
            'men.pathMenu',
            'men.iconMenu',
            'men.deleteable',
            'rol.idRole',
            'rol.rolename',
            'rol.roledescription',
            'rol.deleteable'
        )
        .from('tm_menus as men')
        .leftJoin('tm_menu_role as kmr', 'kmr.idMenu', 'men.idMenu')
        .leftJoin('tm_role as rol', 'rol.idRole', 'kmr.idRole');
};
