'use strict'

let view = new Satori();
const Key = Satori.Key;
let model = view.proxy(new TodosModel((JSON.parse(localStorage.getItem('todos-satori')) || []).map(todo => new Todo(todo))));
let save = () => {localStorage.setItem('todos-satori', JSON.stringify(view.unproxy(model.todos)))};
view.onEvent.add(view.throttle(50, save));
let vm = view.proxy(new ViewModel(model, view));
view.content(view.qs('.content'), TodoAppComponent(vm, view));
Router({'/:filter': filter => {vm.filter = filter}}).init();