import { getLaunch, searchLaunches } from './api.js';
import { el } from './elements.js';
// import { window } from '../index.js';

/**
 * Býr til leitarform.
 * @param {(e: SubmitEvent) => void} searchHandler Fall sem keyrt er þegar leitað er.
 * @param {string | undefined} query Leitarstrengur.
 * @returns {HTMLElement} Leitarform.
 */
export function renderSearchForm(searchHandler, query = undefined) {
  const form = el(
    'form',
    {},
    el('input', { value: query ?? '', name: 'query' }),
    el('button', {}, 'Leita')
  );

  form.addEventListener('submit', searchHandler);

  return form;
}

/**
 * Setur „loading state“ skilabað meðan gögn eru sótt.
 * @param {HTMLElement} parentElement Element sem á að birta skilbaoð í.
 * @param {Element | undefined} searchForm Leitarform sem á að gera óvirkt.
 */
function setLoading(parentElement, searchForm = undefined) {
  let loadingElement = parentElement.querySelector('.loading');

  if (!loadingElement) {
    loadingElement = el('div', { class: 'loading' }, 'Sæki gögn...');
    parentElement.appendChild(loadingElement);
  }

  if (!searchForm) {
    return;
  }

  const button = searchForm.querySelector('button');

  if (button) {
    button.setAttribute('disabled', 'disabled');
  }
}

/**
 * Fjarlægir „loading state“.
 * @param {HTMLElement} parentElement Element sem inniheldur skilaboð.
 * @param {Element | undefined} searchForm Leitarform sem á að gera virkt.
 */
function setNotLoading(parentElement, searchForm = undefined) {
  const loadingElement = parentElement.querySelector('.loading');

  if (loadingElement) {
    loadingElement.remove();
  }

  if (!searchForm) {
    return;
  }

  const disabledButton = searchForm.querySelector('button[disabled]');

  if (disabledButton) {
    disabledButton.removeAttribute('disabled');
  }
}

/**
 * Birta niðurstöður úr leit.
 * @param {import('./api.types.js').Launch[] | null} results Niðurstöður úr leit
 * @param {string} query Leitarstrengur.
 */
function createSearchResults(results, query) {
  const list = el('ul', { class: 'results' });

  if (!results) {
    const noResultsElement = el('li', {}, `Villa við leit að ${query}`);
    list.appendChild(noResultsElement);
    return list;
  }

  if (results.length === 0) {
    const noResultsElement = el(
      'li',
      {},
      `Engar niðurstöður fyrir leit að ${query}`
    );
    list.appendChild(noResultsElement);
    return list;
  }

  for (const result of results) {
    const resultElement = el(
      'div',
      { class: 'result' },
      el(
        'p',
        { class: 'result_name' },
        el('a', { href: `/?id=${result.id}` }, result.name)
      ),
      el('p', { class: 'result_status' }, `🚀 ${result.status.name}`),
      el(
        'p',
        { class: 'result_mission' },
        el('strong', {}, 'Geimferð: '),
        result.mission
      )
    );

    list.appendChild(resultElement);
  }

  return list;
}

/**
 *
 * @param {HTMLElement} parentElement Element sem á að birta niðurstöður í.
 * @param {Element} searchForm Form sem á að gera óvirkt.
 * @param {string} query Leitarstrengur.
 */
export async function searchAndRender(parentElement, searchForm, query) {
  const mainElement = parentElement.querySelector('main');

  if (!mainElement) {
    console.warn('fann ekki <main> element');
    return;
  }

  // Fjarlægja fyrri niðurstöður
  const resultsElement = mainElement.querySelector('.results');
  if (resultsElement) {
    resultsElement.remove();
  }

  setLoading(mainElement, searchForm);
  const results = await searchLaunches(query);
  setNotLoading(mainElement, searchForm);

  const resultsEl = createSearchResults(results, query);

  mainElement.appendChild(resultsEl);
}

/**
 * Sýna forsíðu, hugsanlega með leitarniðurstöðum.
 * @param {HTMLElement} parentElement Element sem á að innihalda forsíðu.
 * @param {(e: SubmitEvent) => void} searchHandler Fall sem keyrt er þegar leitað er.
 * @param {string | undefined} query Leitarorð, ef eitthvað, til að sýna niðurstöður fyrir.
 */
export function renderFrontpage(
  parentElement,
  searchHandler,
  query = undefined
) {
  const heading = el(
    'h1',
    { class: 'heading', 'data-foo': 'bar' },
    'Geimskotaleitin 🚀'
  );
  const searchForm = renderSearchForm(searchHandler, query);

  const container = el('main', {}, heading, searchForm);
  parentElement.appendChild(container);

  if (!query) {
    return;
  }

  searchAndRender(parentElement, searchForm, query);
}

/**
 * Sýna geimskot.
 * @param {HTMLElement} parentElement Element sem á að innihalda geimskot.
 * @param {string} id Auðkenni geimskots.
 */
export async function renderDetails(parentElement, id) {
  const container = el('main', {});
  const backElement = el(
    'div',
    { class: 'back' },
    el('a', { href: '/' }, 'Til baka')
  );

  // Loading
  let loadingElement = parentElement.querySelector('.loading');

  if (!loadingElement) {
    loadingElement = el('div', { class: 'loading' }, 'Sæki gögn...');
    parentElement.appendChild(loadingElement);
  }

  // sækja
  const result = await getLaunch(id);

  // unload
  if (loadingElement) {
    loadingElement.remove();
  }

  if (!result) {
    parentElement.appendChild(el('p', {}, 'Engin bók fannst.'));
    return;
  }

  const headerElement = el(
    'h1',
    { class: 'name_header', style: 'text-align: center;' },
    result.name
  );

  container.appendChild(headerElement);

  const windowElement = el(
    'div',
    { class: 'window' },
    el('p', { class: 'window_start' }, `Gluggi opnast; ${result.window_start}`),
    el('p', { class: 'window_end' }, `Gluggi opnast; ${result.window_end}`)
  );
  container.appendChild(windowElement);

  const statusElement = el(
    'div',
    { class: 'status' },
    el('h2', { class: 'status_header' }, `Staða: ${result.status.name}`),
    el('p', { class: 'status_text' }, result.status.description)
  );
  container.appendChild(statusElement);

  const missionElement = el(
    'div',
    { class: 'mission' },
    el('h2', { class: 'mission_header' }, `Geimferð: ${result.mission.name}`),
    el(
      'p',
      { class: 'mission_text' },
      `Geimferð: ${result.mission.description}`
    )
  );
  container.appendChild(missionElement);

  const imageElement = el('img', { class: 'image', src: result.image });
  container.appendChild(imageElement);

  backElement.addEventListener('click', () => {
    window.history.back();
  });

  container.appendChild(backElement);
  parentElement.appendChild(container);
}
