import { CommonModule } from '@angular/common';
import { Component, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeDragDropService, TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { PickListModule } from 'primeng/picklist';
import { Tree, TreeModule } from 'primeng/tree';
import { MenuRole } from '../../../model/custom-entity/MenuRole';
import { RouterItem } from '../../../model/others/RouterItem';
import { availableMenu, selectedTreeMenus, selectedTreeNode } from '../tree.store';

@Component({
    selector: 'app-tree-menu-picker',
    standalone: true,
    imports: [PickListModule, CommonModule, TreeModule, DialogModule, MultiSelectModule, ButtonModule, FormsModule, Tree],
    templateUrl: './tree-menu-picker.html',
    styleUrl: './tree-menu-picker.css',
    providers: [TreeDragDropService],
    styles: [
        `
            .p-tree-node-dragover {
                border: 1px dashed var(--p-primary-color);
            }
        `,
    ],
})
export class TreeMenuPicker {
    availableTreeMenus: TreeNode[] = [];
    treeMenuList: TreeNode[] = [];

    showPermissionDialog = false;
    selectedNode: TreeNode = { label: '', key: '', data: { roleList: [] } };
    selectedPermissions: string[] = [];

    constructor() {
        effect(() => {
            const tempSelectedMenuList: RouterItem[] | null = selectedTreeNode();
            const tempAllMenuList: MenuRole[] | null = availableMenu();
            const tempMenuList: MenuRole[] | null = this.removeAlreadySelectedMenu(tempSelectedMenuList, tempAllMenuList);
            if (tempMenuList && tempMenuList.length > 0) {
                const tempAvailableTreeNode: TreeNode[] = tempMenuList.map((item: MenuRole) => ({
                    key: item.idMenu.toString(),
                    label: item.nameMenu,
                    icon: item.iconMenu,
                    data: {
                        routerLink: item.pathMenu,
                        roles: item.roleList,
                    },
                }));
                this.availableTreeMenus = tempAvailableTreeNode;
            } else {
                this.availableTreeMenus = [];
            }
            if (tempSelectedMenuList && tempSelectedMenuList.length > 0) {
                this.treeMenuList = this.buildTreeNode(tempSelectedMenuList, tempAllMenuList);
            } else {
                this.treeMenuList = [];
            }
        });
    }

    private removeAlreadySelectedMenu(routerItemList: RouterItem[] | null, menuList: MenuRole[] | null): MenuRole[] | null {
        if (!menuList || menuList.length == 0) return null;
        if (!routerItemList || routerItemList.length === 0) return menuList;
        for (const routerItem of routerItemList) {
            if (routerItem.label) {
                const tempFindIndexMenu = menuList.findIndex((item: MenuRole) => item.nameMenu === routerItem.label);
                if (tempFindIndexMenu !== -1) {
                    menuList.splice(tempFindIndexMenu, 1);
                }
            }
            if (routerItem.items && routerItem.items.length > 0) {
                this.removeAlreadySelectedMenu(routerItem.items, menuList);
            }
        }
        return menuList;
    }

    private buildTreeNode(routerItemList: RouterItem[] | null, menuList: MenuRole[] | null): TreeNode[] {
        if (!routerItemList || routerItemList.length === 0) return [];
        return routerItemList.map((item: RouterItem, index) => ({
            key:
                menuList && menuList.length > 0
                    ? menuList.find((menu: MenuRole) => menu.nameMenu === item.label)?.idMenu.toString()
                    : `${index}-${item.label}`,
            label: item.label,
            icon: item.icon ?? '',
            data: {
                routerLink: item.routerLink,
                roles: item.roles,
            },
            children: item.items ? this.buildTreeNode(item.items, menuList) : [],
        }));
    }

    /** When user drags from left (flat) into tree */
    onNodeDrop(event: any) {
        selectedTreeMenus.set(this.treeMenuList);
    }

    onNodeDoubleClick(event: any) {
        this.showPermissionDialog = true;
        this.selectedNode = event.node;
        if (this.selectedNode.data.permission && this.selectedNode.data.permission.length > 0) {
            this.selectedPermissions = this.selectedNode.data.permission;
        } else {
            this.selectedPermissions = [];
        }
    }

    savePermissions() {
        this.showPermissionDialog = false;
        this.addPermissionToTreeMenu(this.treeMenuList, this.selectedNode, this.selectedPermissions);
        selectedTreeMenus.set([...this.treeMenuList]); // trigger reactivity for signal
    }

    private addPermissionToTreeMenu(nodes: TreeNode[], selectedNode: TreeNode, roleList: string[]): void {
        for (const node of nodes) {
            // 🧹 remove circular reference
            if ('parent' in node) {
                delete (node as any).parent;
            }

            // 🎯 found the node to update
            if (node.key === selectedNode.key) {
                node.data = { ...node.data, permission: [...roleList] }; // replace permissions, no merge
                return; // stop recursion once found
            }

            // 🔁 recurse through children
            if (node.children?.length) {
                this.addPermissionToTreeMenu(node.children, selectedNode, roleList);
            }
        }
    }

    cancelPermissions() {
        this.showPermissionDialog = false;
    }

    // removeNodeByKey(key: string) {
    //     const remove = (nodes: TreeMenuItem[]): TreeMenuItem[] => {
    //         return nodes.filter((n) => n.key !== key).map((n) => ({ ...n, children: n.children ? remove(n.children) : [] }));
    //     };
    //     this.selectedMenus = remove(this.selectedMenus);
    // }
}
