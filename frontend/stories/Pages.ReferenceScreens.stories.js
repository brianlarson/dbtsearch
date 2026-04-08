import {
  renderReference404Page,
  renderReferenceAboutPage,
  renderReferenceAdminEditPage,
  renderReferenceContactPage,
  renderReferenceFaqsPage,
  renderReferenceHomeMarketingPage,
  renderReferenceLoginPage,
  renderReferenceLogoutPage,
  renderReferenceProvidersPageLink,
  renderReferenceRegisterPage,
} from './referenceScreenKit.js';

export default {
  title: 'Pages/Reference Screens',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'One story per route in `docs/reference-markup/README.md`. Parity surface for captured Finder/Bootstrap HTML; full provider listing remains under **Pages / DirectoryPageView**.',
      },
    },
  },
};

function mount(html) {
  const root = document.createElement('div');
  root.innerHTML = html;
  return root;
}

export const Home = {
  render: () => mount(renderReferenceHomeMarketingPage()),
};

export const Providers = {
  render: () => mount(renderReferenceProvidersPageLink()),
};

export const About = {
  render: () => mount(renderReferenceAboutPage()),
};

export const Faqs = {
  render: () => mount(renderReferenceFaqsPage()),
};

export const Contact = {
  render: () => mount(renderReferenceContactPage()),
};

export const Register = {
  render: () => mount(renderReferenceRegisterPage()),
};

export const Login = {
  render: () => mount(renderReferenceLoginPage()),
};

export const Logout = {
  render: () => mount(renderReferenceLogoutPage()),
};

export const Error404 = {
  render: () => mount(renderReference404Page()),
};

export const AdminEditProvider = {
  render: () => mount(renderReferenceAdminEditPage()),
};
