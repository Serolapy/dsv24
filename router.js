import VkBot from 'node-vk-bot-api';
import Markup from 'node-vk-bot-api/lib/markup.js';
import Scene from 'node-vk-bot-api/lib/scene.js';
import Session from 'node-vk-bot-api/lib/session.js';
import Stage from 'node-vk-bot-api/lib/stage.js';


import dotenv from 'dotenv';
dotenv.config();

// const MAX_LENGTH_TEXT = 319;			// максимальное количество символов в валентинке
const bot = new VkBot({
	token: process.env.kupidon_token,
	confirmation: process.env.kupidon_confirmation,
});
const profbot = new VkBot({
	token: process.env.profkom_token,
	confirmation: process.env.profkom_confirmation,
});

const scene = new Scene('valentinki',
  	(ctx) => {
  	  	ctx.scene.next();
  	  	ctx.reply('Начинаем заполнение валентинки. Вставьте ссылку на пользователя, которому вы хотите отправить валентинку. Пример ссылки: https://vk.com/vladi6008');
  	},
  	async (ctx) => {

		const username = ctx.message.text.match(/(?:vk\.com\/(?:id)?|@)([a-zA-Z0-9_.]+)/)[1];

		const users = await bot.execute("users.get", {user_ids:username})
		if (!users.length){
			ctx.scene.step = 1;
			ctx.reply('Пользователь не найден. Проверьте ссылку и попробуйте ещё раз');
			return
		}
		const user = users[0];
		await bot.sendMessage(ctx.message.from_id, `Пользователь найден: это ${user.last_name} ${user.first_name}`);

		try{
			const can_write = await profbot.execute("messages.setActivity", {user_id: user.id, type: 'typing'});
		}
		catch(err){
			ctx.scene.leave();
			ctx.reply('Упс... Мы не можем отправить валентинку этому пользователю, поскольку он ни разу не писал сообщения в сообществе Профкома студентов ПсковГУ. Для того, чтобы мы могли доставить валентинку, её получатель должен разрешить ссобщения от сообщества или написать что-то в ЛС');
			return
		}
  		ctx.session.to = user.id;

  		ctx.scene.next();
  		ctx.reply(`Теперь напишите текст валентинки.`);
  		// ctx.reply(`Теперь напишите текст валентинки. Учтите, что текст валентинки не должен превышать ${MAX_LENGTH_TEXT}-ти символов. Не используйте смайлики`);
  	},
  	(ctx) => {
		// if (ctx.message.text.length > MAX_LENGTH_TEXT){
		// 	ctx.scene.step = 2;
		// 	ctx.reply(`Вы превысили количество допустимый символов (${MAX_LENGTH_TEXT}). Напишите текст валентинки ещё раз.`);
		// 	return
		// }
		
  		ctx.session.text = ctx.message.text;
  		
		ctx.scene.next();
  		ctx.reply(`Как вы хотите отправить валентинку?`, null, Markup.keyboard([
			Markup.button('Анонимно', 'primary'),
			Markup.button('Не анонимно', 'secondary')
		]).oneTime());
  	},
  	async (ctx) => {
		switch(ctx.message.text){
			case 'Анонимно':
				ctx.session.anon = true;
				break;
			case 'Не анонимно':
				ctx.session.anon = false;
				break;
			default:
				ctx.scene.step = 3;
				ctx.reply(`Пожалуйста, воспользуйтесь кнопками`, null, Markup.keyboard([
					Markup.button('Анонимно', 'primary'),
					Markup.button('Не анонимно', 'secondary')
				]).oneTime());
				return
				break;
		};

		const users = await bot.execute("users.get", {user_ids: ctx.session.to})
		const user = users[0];


		ctx.scene.next();
		ctx.reply(`Отправляем эту валентинку пользователю @id${user.id} (${user.first_name} ${user.last_name})${ctx.session.anon ? ' анонимно' : ', указав вас как автора'}?`, null, Markup.keyboard([
			Markup.button('Да', 'positive'),
			Markup.button('Нет', 'negative')
		]).oneTime());
	},
	async (ctx) => {
		switch(ctx.message.text){
			case 'Да':
				const users = await bot.execute("users.get", {user_ids: ctx.message.from_id})
				const user = users[0];
				profbot.sendMessage(ctx.session.to,`💌 Вам пришла ${ctx.session.anon ? 'анонимная' : ''} валентинка${ctx.session.anon ? '' : ` от пользователя @id${user.id} (${user.first_name} ${user.last_name})`}.\n\n${ctx.session.text}`)
				ctx.scene.leave();
				ctx.reply(`Валентинка отправлена!`);
				break;
			case 'Нет':
				ctx.scene.leave();
				ctx.reply(`Отправка валентинки отменена`);
				break;
			default:
				ctx.scene.step = 4;
				ctx.reply(`Пожалуйста, воспользуйтесь кнопками`, null, Markup.keyboard([
					Markup.button('Да', 'positive'),
					Markup.button('Нет', 'negative')
				]).oneTime());
				return
				break;
		};
		ctx.scene.leave();
		
	}
);
const session = new Session();
const stage = new Stage(scene);

bot.use(session.middleware());
bot.use(stage.middleware());


bot.on(async (ctx) => {
	const message = ctx.message;

	//если нажал на кнопку
	if (message['payload']){
		let payload = JSON.parse(message['payload']);

		switch(payload.action){
			case 'valent_start':
				ctx.scene.enter('valentinki')
				break;
			
		}
	}
	else{
		const markup = Markup.keyboard([
			Markup.button({
				action: {
					type: 'text',
					label: 'Отправить валентинку',
					payload: JSON.stringify({
						action: 'valent_start'
					})
				}
			})
		]);
		ctx.reply('Привет! Выбери действие:', null, markup.oneTime());
	}	
});

export let kupidon_router = bot.webhookCallback;
export let profkom_router = profbot.webhookCallback;