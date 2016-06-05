'use strict'

let TodoComponent = (vm, view, todo) => {
	let edit;

	return view.li({
		class: {completed: () => todo.completed, editing: () => todo.editing},
		content: [
			view.div({
				class: 'view',
				content: [
					view.input({
						class: 'toggle',
						attr: {type: 'checkbox'},
						bind: {model: todo, key: 'completed'}}),
					view.label({
						on: {dblclick() {
							edit.value = todo.title;
							vm.startEdit(todo);
							view.focus(edit);
						}},
						content: () => todo.title}),
					view.button({
						class: 'destroy',
						on: {click() {vm.model.remove(todo)}}})],
			}),
			edit = view.input({
				class: 'edit',
				on: {blur() {vm.saveEdit(todo, this.value)}},
				keydown: {
					[view.Key.ENTER]: el => {el.blur()},
					[view.Key.ESCAPE]: () => {vm.cancelEdit(todo)},
				}})]});
};

let TodoAppComponent = (vm, view) =>
	view.section({
		class: 'todoapp',
		content: [
			view.header({
				class: 'header',
				content: [
					view.h1({
						content: 'todos',
					}),
					view.input({
						class: 'new-todo',
						attr: {placeholder: 'What needs to be done?', autofocus: ''},
						keydown: view.inputKeyHandler(value => vm.model.add(value), {reset: true})})]}),
			view.section({
				class: 'main',
				show: () => vm.model.todos.length,
				content: [
					view.input({
						class: 'toggle-all',
						attr: {id: 'toggle-all', type: 'checkbox'},
						bind: {model: vm, key: 'allCompleted'}}),
					view.label({
						attr: {for: 'toggle-all'},
						content: 'Mark all as complete',
					}),
					view.ul({
						class: 'todo-list',
						list: {array: () => vm.items, item: todo =>
							TodoComponent(vm, view, todo)}})]}),
			view.footer({
				class: 'footer',
				show: () => vm.model.todos.length,
				content: [
					view.span({
						class: 'todo-count',
						content: () => [
							view.strong(vm.remainingCount), ' ',
							view.pluralize('item', vm.remainingCount), ' left',
						]}),
					view.ul({
						class: 'filters',
						content: () => Array.from(view.unproxy(vm.filters)).map(filter =>
							view.li(
								view.a({
									class: {selected: () => filter[0] === vm.filter},
									attr: {href: '#/' + filter[0]},
									content: filter[1].title})))}),
					view.button({
						class: 'clear-completed',
						show: () => vm.completedCount,
						on: {click() {vm.model.clearCompleted()}},
						content: 'Clear completed'})]})]});

if (typeof module !== 'undefined') {
	module.exports = {
		TodoComponent,
		TodoAppComponent,
	};
}
