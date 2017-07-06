import { ProjectorMixin } from '@dojo/widget-core/mixins/Projector';
import { Container } from './App';

const root = document.querySelector('my-app') || undefined;

const Projector = ProjectorMixin(Container);
const projector = new Projector();

projector.append(root);
