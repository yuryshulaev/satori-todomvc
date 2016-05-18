'use strict'

class Todo {
	constructor(data) { Object.assign(this, data); }
	toJSON() { return {title: this.title, completed: this.completed}; }
}

class TodosModel {
	constructor(todos) { this.todos = todos || []; }
	add(title) { this.todos.push(new Todo({title: title.trim(), completed: false})); }
	setTitle(todo, title) { (todo.title = title.trim()) || this.remove(todo); }
	remove(todo) { view.arrayRemove(this.todos, todo); }
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
		let proxy = view.proxy(this);
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

let TodoComponent = (vm, view, todo) => {
	let edit;

	return view.li({class: {completed: () => todo.completed, editing: () => todo.editing}}, [
		view.div({class: 'view'}, [
			view.input({class: 'toggle', attr: {type: 'checkbox'}, bind: {model: todo, key: 'completed'}}),
			view.label({on: {dblclick() {edit.value = todo.title; vm.startEdit(todo); view.focus(edit)}}}, () => todo.title),
			view.button({class: 'destroy', on: {click() {vm.model.remove(todo)}}})]),
		edit = view.input({class: 'edit', on: {blur() {vm.saveEdit(todo, this.value)}},
			keydown: {[view.Key.ENTER]: el => {el.blur()}, [view.Key.ESCAPE]: () => {vm.cancelEdit(todo)}}})]);
};

let TodoAppComponent = (vm, view) =>
	view.section({class: 'todoapp'}, [
		view.header({class: 'header'}, [
			view.h1('todos'),
			view.input({class: 'new-todo', attr: {placeholder: 'What needs to be done?', autofocus: ''},
				keydown: view.inputKeyHandler(value => vm.model.add(value), {reset: true})})]),
		view.section({class: 'main', show: () => vm.model.todos.length}, [
			view.input({class: 'toggle-all', attr: {id: 'toggle-all', type: 'checkbox'}, bind: {model: vm, key: 'allCompleted'}}),
			view.label({attr: {for: 'toggle-all'}}, 'Mark all as complete'),
			view.ul({class: 'todo-list', list: {array: () => vm.items, item: todo => TodoComponent(vm, view, todo)}})]),
		view.footer({class: 'footer', show: () => vm.model.todos.length}, [
			view.span({class: 'todo-count'}, () => [view.strong(vm.remainingCount), ' ', view.pluralize('item', vm.remainingCount), ' ', 'left']),
			view.ul({class: 'filters'}, () => Array.from(view.unproxy(vm.filters)).map(filter =>
				view.li(view.a({class: {selected: () => filter[0] === vm.filter}, attr: {href: '#/' + filter[0]}}, filter[1].title)))),
			view.button({class: 'clear-completed', show: () => vm.completedCount, on: {click() {vm.model.clearCompleted()}}}, 'Clear completed')])]);

if (typeof module !== 'undefined') {
	module.exports = {Todo, TodosModel, ViewModel, TodoComponent, TodoAppComponent};
}
