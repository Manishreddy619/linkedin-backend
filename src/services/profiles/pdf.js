import PdfPrinter from 'pdfmake';

import axios from 'axios';
const fonts = {
	Roboto: {
		normal: 'Helvetica',
		bold: 'Helvetica-Bold',
	},
};
const printer = new PdfPrinter(fonts);
export const getPdfReadableStream = async (currentProfile) => {
	let imagePart = {};
	if (currentProfile.image) {
		const response = await axios.get(currentProfile.image, {
			responseType: 'arraybuffer',
		});
		const currentProfileimageURLParts = currentProfile.image.split('/');
		const fileName =
			currentProfileimageURLParts[currentProfileimageURLParts.length - 1];
		const [id, extension] = fileName.split('.');
		const base64 = response.data.toString('base64');
		const base64Image = `data:image/${extension};base64,${base64}`;
		imagePart = { image: base64Image, width: 500, margin: [0, 0, 0, 40] };
	}
	const docDefinition = {
		content: [
			imagePart,
			{
				text: currentProfile.title,
				fontSize: 20,
				bold: true,
				margin: [0, 0, 0, 40],
			},
			{ text: currentProfile.name },
			{ text: currentProfile.surname },
			{ text: currentProfile.email },
			{ text: currentProfile.bio },
			{ text: currentProfile.area },
			{ text: currentProfile.username },
		],
	};

	const pdfReadableStream = printer.createPdfKitDocument(docDefinition, {});
	pdfReadableStream.end();

	return pdfReadableStream;
};
