'use strict'

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

		view.observer('items', () => {
			proxy.items = model.todos.filter(this.filters.get(proxy.filter).func);
		});
	}

	get remainingCount() {
		return this.model.remaining.length;
	}

	get completedCount() {
		return this.model.completed.length;
	}

	get allCompleted() {
		return !this.remainingCount;
	}

	set allCompleted(value) {
		this.model.todos.forEach(todo => {
			todo.completed = value;
		});
	}

	startEdit(todo) {
		todo.editing = true;
	}

	cancelEdit(todo) {
		todo.editing = false;
	}

	saveEdit(todo, newTitle) {
		if (!todo.editing) {
			return;
		}

		this.model.setTitle(todo, newTitle);
		todo.editing = false;
	}
}

if (typeof module !== 'undefined') {
	module.exports = {
		ViewModel,
	};
}
