'use strict'

const view = new Satori();
const utils = {arrayRemove: view.arrayRemove};
const model = view.proxy(new TodosModel((JSON.parse(localStorage.getItem('todos-satori')) || []).map(todo => new Todo(todo))));
const save = () => {localStorage.setItem('todos-satori', JSON.stringify(view.unproxy(model.todos)))};
view.onEvent.add(view.throttle(50, save));
const vm = view.proxy(new ViewModel(model, view));
view.content(view.qs('.content'), TodoAppView(vm, view, view.h));
Router({'/:filter': filter => {vm.filter = filter}}).init();
