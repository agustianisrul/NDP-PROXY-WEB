import { signal } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { MenuRole } from '../../model/custom-entity/MenuRole';
import { RouterItem } from '../../model/others/RouterItem';

export const availableMenu = signal<MenuRole[] | null>(null);
export const selectedTreeNode = signal<RouterItem[] | null>(null);

export const selectedTreeMenus = signal<TreeNode[] | null>(null);
