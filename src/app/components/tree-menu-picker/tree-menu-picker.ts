import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeDragDropService, TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { PickListModule } from 'primeng/picklist';
import { Tree, TreeModule } from 'primeng/tree';
import { MenuRole } from '../../../model/custom-entity/MenuRole';
import { RouterItem } from '../../../model/others/RouterItem';

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
export class TreeMenuPicker implements OnInit, OnChanges {
    @Input() menuRoleList: any[] = [];
    @Input() treeMenuList: any[] = [];

    @Output() treeMenuListChange = new EventEmitter<TreeNode[]>();

    availableTreeMenus: TreeNode[] = [];
    showPermissionDialog = false;
    selectedNode: TreeNode = { label: '', key: '', data: { roleList: [] } };
    selectedPermissions: string[] = [];

    ngOnInit(): void {}

    ngOnChanges(changes: SimpleChanges): void {
        // const tempSelectedMenuList: RouterItem[] = this.treeMenuList;
        const tempAllMenuList: MenuRole[] = this.menuRoleList;
        const tempMenuList: MenuRole[] = this.removeAlreadySelectedMenu(this.treeMenuList, tempAllMenuList);
        this.availableTreeMenus = this.buildAvailableMenu(tempMenuList) ?? [];
        // this.treeMenuList = this.buildTreeNode(tempSelectedMenuList, tempAllMenuList) ?? [];
    }

    private buildAvailableMenu(menuList: MenuRole[]): TreeNode[] {
        if (!menuList || menuList.length === 0) return [];
        return menuList.map((item: MenuRole) => ({
            key: item.idMenu.toString(),
            label: item.nameMenu,
            icon: item.iconMenu,
            data: {
                routerLink: item.pathMenu,
                roleList: item.roleList,
            },
        }));
    }

    private removeAlreadySelectedMenu(routerItemList: RouterItem[], menuList: MenuRole[]): MenuRole[] {
        if (!menuList || menuList.length == 0) return [];
        if (!routerItemList || routerItemList.length === 0) return menuList;
        for (const routerItem of routerItemList) {
            if (routerItem.label) {
                const tempFindMenu = menuList.find((item: MenuRole) => item.nameMenu === routerItem.label);
                const tempFindIndexMenu = menuList.findIndex((item: MenuRole) => item.nameMenu === routerItem.label);
                if (tempFindIndexMenu !== -1) {
                    routerItem.data.roleList = tempFindMenu?.roleList;
                    menuList.splice(tempFindIndexMenu, 1);
                }
            }
            if (routerItem.children && routerItem.children.length > 0) {
                this.removeAlreadySelectedMenu(routerItem.children, menuList);
            }
        }
        return menuList;
    }

    private buildTreeNode(routerItemList: RouterItem[] | null, menuList: MenuRole[] | null): TreeNode[] {
        if (!routerItemList || routerItemList.length === 0) return [];
        return routerItemList.map((item: RouterItem) => ({
            key: item.key,
            label: item.label,
            icon: item.icon ?? '',
            data: {
                routerLink: item.data?.routerLink,
                roleList: item.data?.roleList,
            },
            children: item.children ? this.buildTreeNode(item.children, menuList) : [],
        }));
    }

    /** When user drags from left (flat) into tree */
    moveNodeToSelected(event: any) {
        const sanitizedTree = this.removeCircularReferences(this.treeMenuList);
        this.treeMenuListChange.emit(sanitizedTree);
    }

    private removeCircularReferences(nodes: TreeNode[]): TreeNode[] {
        for (const node of nodes) {
            // 🧹 remove circular reference
            if ('parent' in node) {
                delete (node as any).parent;
            }

            // 🔁 recurse through children
            if (node.children?.length) {
                this.removeCircularReferences(node.children);
            }
        }
        return nodes;
    }

    onNodeSelect(event: any) {
        this.selectedNode = event.node;
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

    moveNodeToAvailable(event: any) {
        const sanitizedTree = this.removeCircularReferences(this.treeMenuList);
        this.treeMenuListChange.emit(sanitizedTree);
    }

    savePermissions() {
        this.showPermissionDialog = false;

        const tempTreeMenuList = this.addPermissionToTreeMenu(this.treeMenuList, this.selectedNode, this.selectedPermissions);

        // Remove circular references before emitting
        const sanitizedTree = this.removeCircularReferences(tempTreeMenuList);
        this.treeMenuListChange.emit(sanitizedTree);
    }

    private addPermissionToTreeMenu(nodes: TreeNode[], selectedNode: TreeNode, roleList: string[] = []): TreeNode[] {
        return nodes.map((node: TreeNode) => {
            const newNode = { ...node };

            if (newNode.key === selectedNode.key) {
                newNode.data = {
                    ...newNode.data,
                    permission: [...roleList], // Create new array to avoid reference issues
                };
            }

            if (newNode.children && newNode.children.length > 0) {
                newNode.children = this.addPermissionToTreeMenu(newNode.children, selectedNode, roleList);
            }

            return newNode;
        });
    }

    // private removeCircularReferences(tree: TreeNode[]): TreeNode[] {
    //     const sanitizeNode = (node: TreeNode): TreeNode => {
    //         const { parent, ...sanitizedNode } = node as any;

    //         if (sanitizedNode.children && sanitizedNode.children.length > 0) {
    //             sanitizedNode.children = sanitizedNode.children.map(sanitizeNode);
    //         }

    //         return sanitizedNode as TreeNode;
    //     };

    //     return tree.map(sanitizeNode);
    // }

    cancelPermissions() {
        this.showPermissionDialog = false;
    }
}
