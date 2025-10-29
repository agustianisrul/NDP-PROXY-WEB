import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeDragDropService, TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { PickListModule } from 'primeng/picklist';
import { Tree, TreeModule } from 'primeng/tree';

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
export class TreeMenuPicker implements OnInit {
    availableMenus = signal<TreeNode[]>([]);
    selectedMenus = signal<TreeNode[]>([]);

    // showPermissionDialog = false;
    // currentEditNode: TreeMenuItem | null = null;
    // selectedPermissions: string[] = [];

    // availablePermissions = [
    //     { label: 'View', value: 'view' },
    //     { label: 'Create', value: 'create' },
    //     { label: 'Edit', value: 'edit' },
    //     { label: 'Delete', value: 'delete' },
    // ];

    ngOnInit(): void {
        const data: TreeNode[] = [
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'overview', label: 'Overview' },
            { key: 'stats', label: 'Stats' },
            { key: 'settings', label: 'Settings' },
            { key: 'users', label: 'Users' },
            { key: 'permissions', label: 'Permissions' },
            { key: 'dashboard 2', label: 'Dashboard 2' },
            { key: 'overview 2', label: 'Overview 2' },
            { key: 'stats 2', label: 'Stats 2' },
            { key: 'settings 2', label: 'Settings 2' },
            { key: 'users 2', label: 'Users 2' },
            { key: 'permissions 2', label: 'Permissions 2' },
        ];
        this.availableMenus.set(data);
        this.selectedMenus.set([]);
    }

    /** When user drags from left (flat) into tree */
    // onNodeDrop(event: any) {
    //     const draggedItem: FlatMenuItem = event.dragNode.data;
    //     const dropNode: TreeMenuItem = event.dropNode?.data;
    //     const dropPosition = event.dropPosition;

    //     this.selectedMenus.
    //     const newNode: TreeNode = {
    //         key: draggedItem.key,
    //         label: draggedItem.label,
    //         children: [],
    //     };

    //     if (!dropNode) {
    //         // dropped in empty space -> add as root
    //         this.selectedMenus.set(newNode);
    //     } else if (dropPosition === 0) {
    //         // dropped on top of node -> nested child
    //         dropNode.children = dropNode.children || [];
    //         dropNode.children.push(newNode);
    //     } else {
    //         // dropped above/below -> sibling (root)
    //         const index = this.selectedMenus.findIndex((n) => n.key === dropNode.key);
    //         if (index >= 0) this.selectedMenus.splice(index + (dropPosition === 1 ? 1 : 0), 0, newNode);
    //         else this.selectedMenus.push(newNode);
    //     }

    //     this.availableMenus = this.availableMenus.filter((m) => m.key !== draggedItem.key);
    //     this.openPermissionDialog(newNode);
    // }

    // openPermissionDialog(node: TreeMenuItem) {
    //     this.currentEditNode = node;
    //     this.selectedPermissions = node.permissions || [];
    //     this.showPermissionDialog = true;
    // }

    // savePermissions() {
    //     if (this.currentEditNode) {
    //         this.currentEditNode.permissions = [...this.selectedPermissions];
    //     }
    //     this.showPermissionDialog = false;
    // }

    // cancelPermissions() {
    //     // if user cancels and node has no permissions, remove it
    //     if (this.currentEditNode && !this.currentEditNode.permissions?.length) {
    //         this.removeNodeByKey(this.currentEditNode.key);
    //         this.availableMenus.push({
    //             key: this.currentEditNode.key,
    //             label: this.currentEditNode.label,
    //         });
    //     }
    //     this.showPermissionDialog = false;
    // }

    // removeNodeByKey(key: string) {
    //     const remove = (nodes: TreeMenuItem[]): TreeMenuItem[] => {
    //         return nodes.filter((n) => n.key !== key).map((n) => ({ ...n, children: n.children ? remove(n.children) : [] }));
    //     };
    //     this.selectedMenus = remove(this.selectedMenus);
    // }
}
