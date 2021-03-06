'use strict'

class Todo {
	constructor(data) { Object.assign(this, data); }
	toJSON() { return {title: this.title, completed: this.completed}; }
}

class TodosModel {
	constructor(todos) { this.todos = todos || []; }
	add(title) { this.todos.push(new Todo({title: title.trim(), completed: false})); }
	setTitle(todo, title) { (todo.title = title.trim()) || this.remove(todo); }
	remove(todo) { utils.arrayRemove(this.todos, todo); }
	get remaining() { return this.todos.filter(todo => !todo.completed); }
	get completed() { return this.todos.filter(todo => todo.completed); }
	clearCompleted() { this.todos = this.remaining; }
}

class ViewModel {
	constructor(model, view, filter) {
		this.filters = new Map([
			['all', {title: 'All', func: () => true}],
			['active', {title: 'Active', func: todo => !todo.completed}],
			['completed', {title: 'Completed', func: todo => todo.completed}],
		]);

		this.model = model;
		this.view = view;
		this.filter = filter || 'all';
		const proxy = view.proxy(this);
		view.observer('items', () => {proxy.items = model.todos.filter(this.filters.get(proxy.filter).func)});
	}

	get remainingCount() { return this.model.remaining.length; }
	get completedCount() { return this.model.completed.length; }
	get allCompleted() { return !this.remainingCount; }
	set allCompleted(value) { this.model.todos.forEach(todo => {todo.completed = value}); }
	startEdit(todo) { todo.editing = true; }
	cancelEdit(todo) { todo.editing = false; }

	saveEdit(todo, newTitle) {
		if (!todo.editing) return;
		this.model.setTitle(todo, newTitle);
		todo.editing = false;
	}
}

const TodoView = (vm, view, h, todo) => {
	let edit;

	return h('li', {class: {completed: () => todo.completed, editing: () => todo.editing}}, [
		h('div', {class: 'view'}, [
			h('input', {class: 'toggle', attr: {type: 'checkbox'}, bind: {model: todo, key: 'completed'}}),
			h('label', {on: {dblclick() {edit.value = todo.title; vm.startEdit(todo); view.focus(edit)}}}, () => todo.title),
			h('button', {class: 'destroy', on: {click() {vm.model.remove(todo)}}})]),
		edit = h('input', {class: 'edit', on: {blur() {vm.saveEdit(todo, this.value)}},
			keydown: {[view.Key.ENTER]: el => {el.blur()}, [view.Key.ESCAPE]: () => {vm.cancelEdit(todo)}}})]);
};

const TodoAppView = (vm, view, h) =>
	h('section', {class: 'todoapp'}, [
		h('header', {class: 'header'}, [
			h('h1', {}, 'todos'),
			h('input', {class: 'new-todo', attr: {placeholder: 'What needs to be done?', autofocus: ''},
				keydown: view.inputKeyHandler(value => vm.model.add(value), {reset: true})})]),
		h('section', {class: 'main', show: () => vm.model.todos.length}, [
			h('input', {class: 'toggle-all', attr: {id: 'toggle-all', type: 'checkbox'}, bind: {model: vm, key: 'allCompleted'}}),
			h('label', {attr: {for: 'toggle-all'}}, 'Mark all as complete'),
			h('ul', {class: 'todo-list', list: {array: () => vm.items, item: todo => TodoView(vm, view, h, todo)}})]),
		h('footer', {class: 'footer', show: () => vm.model.todos.length}, [
			h('span', {class: 'todo-count'}, () => [h('strong', {}, vm.remainingCount), ' ', view.pluralize('item', vm.remainingCount), ' ', 'left']),
			h('ul', {class: 'filters'}, () => Array.from(view.unproxy(vm.filters)).map(filter =>
				h('li', {}, h('a', {class: {selected: () => filter[0] === vm.filter}, attr: {href: '#/' + filter[0]}}, filter[1].title)))),
			h('button', {class: 'clear-completed', show: () => vm.completedCount, on: {click() {vm.model.clearCompleted()}}}, 'Clear completed')])]);

if (typeof module !== 'undefined') {
	module.exports = {Todo, TodosModel, ViewModel, TodoView, TodoAppView};
}
