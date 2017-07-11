import { deepAssign } from '@dojo/core/lang';
import { w, v } from '@dojo/widget-core/d';
import { DNode, WidgetProperties } from '@dojo/widget-core/interfaces';
import { WidgetBase, beforeRender } from '@dojo/widget-core/WidgetBase';
import { theme, ThemeableMixin } from '@dojo/widget-core/mixins/Themeable';

import * as css from './styles/app.m.css';

export interface AccordionTitleProperties {
	active: boolean;
}

export interface AccordionPanelProperties {
	key: string;
	title: string;
	active: boolean;
	exclusive: boolean;
	onAccordionPanelSelected: (id: string, checked: boolean) => void;
}
export interface AccordionProperties {
	panels: any;
	exclusive: boolean;
	onAccordionPanelSelected: (id: string, checked: boolean) => void;
	onAccordionPanelsClosed?: () => void;
}

const Base = ThemeableMixin(WidgetBase);

@theme(css)
export class AccordionTitle extends Base<AccordionTitleProperties> {
	protected render(): DNode {
		const { active } = this.properties;

		return v('span', [
			v('label', {for: 'close_g_id'}),
			v('h5', {
				classes: this.classes(css.button, active ? css.active : null)
			}, this.children)
		]);
	}
}

export class AccordionPanel extends Base<AccordionPanelProperties> {

	private _onChange({ target: { checked } }: any) {
		this.properties.onAccordionPanelSelected(this.properties.key, checked);
	}

	protected render(): DNode {
		const { title, active, exclusive, onAccordionPanelSelected } = this.properties;
		return v('label', [
			v('input', {
				checked: active,
				type: !!exclusive ? 'radio' : 'checkbox',
				name: '_g_id',
				onchange: this._onChange
			}),
			w(AccordionTitle, { active }, [ title ])
		]);
	}
}

export class Accordion extends WidgetBase<AccordionProperties> {

	private _onAccordionPanelsClosed(event: MouseEvent): void {
		this.properties.onAccordionPanelsClosed && this.properties.onAccordionPanelsClosed();
	}

	protected render(): DNode {
		const { onAccordionPanelsClosed, exclusive, panels = [] } = this.properties;

		let children: DNode[] = panels.map((panel: any) => {
			const { id: key, title, active } = panel;

			return w(AccordionPanel, {
				key,
				title,
				active,
				exclusive,
				onAccordionPanelSelected: this.properties.onAccordionPanelSelected
			});
		});

		if (!!exclusive) {
			children.push(v('input', {
				type: 'radio',
				name: '_g_id',
				id: 'close_g_id',
				onchange: this._onAccordionPanelsClosed
			}));
		}
		return v('fieldset', children);
	}
}

export class App extends WidgetBase<WidgetProperties> {

	private _exlusiveAccordianPanels = [
		{
			id: '1',
			title: 'title',
			meta: 'meta',
			content: 'Lorem Ipsum',
			active: true
		},
		{
			id: '2',
			title: 'title2',
			meta: 'meta2',
			content: 'Lorem Ipsum dolor sunt'
		}
	];

	private _standardAccordianPanels = [
		{
			id: '1',
			title: 'title',
			meta: 'meta',
			content: 'Lorem Ipsum',
			active: true
		},
		{
			id: '2',
			title: 'title2',
			meta: 'meta2',
			content: 'Lorem Ipsum dolor sunt'
		}
	];

	private _onExclusivePanelSelected(paneId?: string, active?: boolean) {
		const panels = [ ...this._exlusiveAccordianPanels ];
		this._exlusiveAccordianPanels = [ ...this._exlusiveAccordianPanels ].map((panel) => {
			if (panel.id === paneId) {
				return { ...panel, active };
			}
			return { ...panel, active: false };
		});
		this.invalidate();
	}

	private _onStandardPanelSelected(paneId: string, active: boolean) {
		const panels = [ ...this._exlusiveAccordianPanels ];
		this._standardAccordianPanels = [ ...this._standardAccordianPanels ].map((panel) => {
			if (panel.id === paneId) {
				return { ...panel, active };
			}
			return panel;
		});
		this.invalidate();
	}

	protected render(): DNode[] {
		return [
			v('span', [ 'Accordion logic for "exclusive: false"' ]),
			w(Accordion, {
				key: 'standard',
				exclusive: false,
				panels: this._standardAccordianPanels,
				onAccordionPanelSelected: this._onStandardPanelSelected
			}),
			v('span', [ 'Accordion logic for "exclusive: true" (last radio = close all stub) ']),
			w(Accordion, {
				key: 'exclusive',
				exclusive: true,
				panels: this._exlusiveAccordianPanels,
				onAccordionPanelSelected: this._onExclusivePanelSelected,
				onAccordionPanelsClosed: this._onExclusivePanelSelected
			})
		];
	}
}
