import { render } from 'preact';
import { App } from '@ui/App';
import { loadFx } from '@state/fx';
import './styles/app.css';

const root = document.getElementById('app');
if (root) render(<App />, root);

// pull live FX in the background; the page already works on baked fallbacks
void loadFx();
