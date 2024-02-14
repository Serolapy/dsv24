import { createCanvas, registerFont, Image } from 'canvas';

const PATH_TO_IMG = 'plugins/dsv24/image/img.png';
const PATH_TO_FONT = 'plugins/dsv24/image/font.ttf';

registerFont(PATH_TO_FONT, { family: 'Font' });
export default function (text, callback){
// 	a('gsdgfdsfg');
// function a(text, callback){
	const img = new Image();
	img.onerror = (err) => {
		console.log(err)
	}

	img.onload = function() {
		const canvas = createCanvas(img.width, img.height);
  		const ctx = canvas.getContext('2d');
		
		// Отрисовываем изображение
		ctx.drawImage(img, 0, 0, img.width, img.height);

		// Задаем параметры текста
		let kolvo_simv = text.length;
		let textSize = 0;
		
		if (kolvo_simv <= 45) {
		  	let maxsimv = true;
		  	for (let word of text.split(" ")) {
				if (word.length > 13) {
					maxsimv = false;
			  		break;
				}
		  	}
		  	if (maxsimv && splitText(text, 13).split('\n').length <= 5) {
				textSize = 79;
				text = splitText(text, 13);
		  	}
		}
		
		if (textSize === 0 && kolvo_simv <= 126) {
			if (splitText(text, 18).split('\n').length <= 7) {
				textSize = 55;
				text = splitText(text, 18);
		  	}
		}
		
		if (kolvo_simv <= 319) {
		  	textSize = 35;
		  	text = splitText(text, 28);
		} 
		else {
			callback("Много символов", null);
			return
		}

		ctx.font = `${textSize}px Font`;
		ctx.fillStyle = '#862523';

		// Рисуем текст на изображении
 		ctx.fillText(text, 425, 353 - textSize * text.split('\n').length / 2); // текст и его позиция

		// Получение URL картинки из холста
		const imageUrl = canvas.toDataURL();
		callback(null, imageUrl);

		// // Сохраняем изображение
		// const out = fs.createWriteStream('./new_image.jpg');
		// const stream = canvas.createJPEGStream();
		// stream.pipe(out);
		// out.on('finish', () => console.log('The new image with text was created.'));
	}
	img.src = PATH_TO_IMG;

}


function splitText(text, max_width) {
	// разбиение на строки, если были переносы
	let rows = text.split("\n");
	//разбиение на слова
	for (let k = 0; k < rows.length; k++) {
		rows[k] = wrapText(rows[k], max_width).join("\n");
	}
	return rows.join("\n");
}

function wrapText(text, maxWidth) {
    
    let lines = [];
	const rows = text.split('\n');
	for(let row of rows){
		const words = row.split(' ');
		let currentLine = '';
	
		words.forEach(word => {
			if (currentLine.length + word.length <= maxWidth) {
				currentLine += word + ' ';
			} else {
				lines.push(currentLine.trim());
				currentLine = word + ' ';
			}
		});
	
		if (currentLine.trim() !== '') {
			lines.push(currentLine.trim());
		}
	}
	

    return lines;
}