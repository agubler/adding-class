import { w, v } from '@dojo/widget-core/d';
import { DNode, WidgetProperties } from '@dojo/widget-core/interfaces';
import { WidgetBase } from '@dojo/widget-core/WidgetBase';
import { theme, ThemeableMixin } from '@dojo/widget-core/mixins/Themeable';

import * as css from './styles/app.m.css';

export interface ItemProperties {
    id: string;
	onClick: (id: string) => void;
    selected: boolean;
}

const ItemBase = ThemeableMixin(WidgetBase);

@theme(css)
export class Item extends ItemBase<ItemProperties> {
    
    private _onClick(event: MouseEvent) {
        this.properties.onClick(this.properties.id);
    }

    protected render(): DNode {
        const { id, selected } = this.properties;
        return v('li', [
            v('button', { onclick: this._onClick, classes: this.classes(css.button, selected ? css.active : null) }, [ `Hello Item ${id}` ])
        ]);
    }
}

const items: string[] = ['a', 'b', 'c'];

export class Container extends WidgetBase {
    private _selectedId: string;

    private _onItemClicked(id: string): void {
        this._selectedId = id;
        this.invalidate();
    }

    protected render(): DNode {
        return v('div', items.map((id) => {
            return w(Item, { key: id, id, selected: id === this._selectedId, onClick: this._onItemClicked });
        }));
    }
}

