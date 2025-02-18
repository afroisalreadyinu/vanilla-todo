import { AppIcon } from './AppIcon.js';
import { AppSortable } from './AppSortable.js';
import { TodoCustomList } from './TodoCustomList.js';

export function TodoFrameCustom(el) {
  const state = {
    customLists: [],
    items: [],
    customAt: 0,
    show: true,
  };

  el.innerHTML = `
    <div class="leftcontrols">
      <p><button class="app-button -circle -xl back"><i class="app-icon" data-id="chevron-left-24"></i></button></p>
    </div>
    <div class="container"></div>
    <div class="rightcontrols">
      <p><button class="app-button -circle -xl forward"><i class="app-icon" data-id="chevron-right-24"></i></button></p>
      <p><button class="app-button -circle -xl add"><i class="app-icon" data-id="plus-circle-24"></i></button></p>
    </div>
  `;

  AppSortable(el.querySelector('.container'), { direction: 'horizontal' });

  setTimeout(() => el.classList.add('-animated'), 200);

  el.querySelectorAll('.app-icon').forEach(AppIcon);

  el.querySelector('.back').addEventListener('click', () =>
    el.dispatchEvent(
      new CustomEvent('seekCustomTodoLists', { detail: -1, bubbles: true })
    )
  );

  el.querySelector('.forward').addEventListener('click', () =>
    el.dispatchEvent(
      new CustomEvent('seekCustomTodoLists', { detail: 1, bubbles: true })
    )
  );

  el.querySelector('.add').addEventListener('click', () => {
    el.dispatchEvent(
      new CustomEvent('addTodoList', { detail: {}, bubbles: true })
    );
    // TODO seek if not at end
  });

  el.addEventListener('sortableDrop', (e) => {
    if (!e.detail.data.list) return;

    el.dispatchEvent(
      new CustomEvent('moveTodoList', {
        detail: {
          list: e.detail.data.list,
          index: e.detail.index,
        },
        bubbles: true,
      })
    );
  });

  el.addEventListener('draggableOver', (e) => {
    if (!e.detail.data.list) return;

    updatePositions();
  });

  el.addEventListener('todoData', (e) => update(e.detail));

  function update(next) {
    Object.assign(state, next);

    const lists = getLists();
    const container = el.querySelector('.container');
    const obsolete = new Set(container.children);
    const childrenByKey = new Map();

    obsolete.forEach((child) => childrenByKey.set(child.dataset.key, child));

    const children = lists.map((list) => {
      let child = childrenByKey.get(list.id);

      if (child) {
        obsolete.delete(child);
      } else {
        child = document.createElement('div');
        child.className = 'card todo-custom-list';
        child.dataset.key = list.id;
        TodoCustomList(child);
      }

      child.dispatchEvent(new CustomEvent('todoCustomList', { detail: list }));

      return child;
    });

    obsolete.forEach((child) => container.removeChild(child));

    children.forEach((child, index) => {
      if (child !== container.children[index]) {
        container.insertBefore(child, container.children[index]);
      }
    });

    updatePositions();
    updateHeight();
  }

  function updatePositions() {
    el.querySelectorAll('.container > *').forEach((child, index) => {
      child.style.transform = `translateX(${(index - state.customAt) * 100}%)`;
    });
  }

  function updateHeight() {
    let height = 280;
    const container = el.querySelector('.container');

    for (let i = 0, l = container.children.length; i < l; ++i) {
      height = Math.max(container.children[i].offsetHeight, height);
    }

    el.style.height = `${height + 50}px`;

    for (let i = 0, l = container.children.length; i < l; ++i) {
      container.children[i].style.height = `${height}px`;
    }
  }

  function getLists() {
    return state.customLists
      .map((list) => ({
        id: list.id,
        index: list.index,
        title: list.title,
        items: getItemsForList(list.id),
      }))
      .sort((a, b) => a.index - b.index);
  }

  function getItemsForList(listId) {
    return state.items
      .filter((item) => item.listId === listId)
      .sort((a, b) => a.index - b.index);
  }
}
