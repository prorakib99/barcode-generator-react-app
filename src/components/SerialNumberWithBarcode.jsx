import { useState, useRef } from 'react';
import Barcode from 'react-barcode';
import jsPDF from 'jspdf';
import domtoimage from 'dom-to-image';
import moment from 'moment';

const SerialNumberWithBarcode = () => {
    const [quantity, setQuantity] = useState(1);
    const [serialNumbers, setSerialNumbers] = useState([]);
    const [companyName, setCompanyName] = useState('Shakib Electronics'); // Default company name
    const barcodeRefs = useRef([]);

    const generateSerialNumbers = () => {
        const numbers = [];
        for (let i = 0; i < quantity; i++) {
            numbers.push(Date.now() + i); // Generate serial numbers with a unique identifier (e.g., index)
        }
        setSerialNumbers(numbers);
    };

    const generatePDF = () => {
        const doc = new jsPDF('p', 'mm', 'a4'); // Initialize PDF document

        const rowHeight = 16; // Height of each row (adjust as needed)
        const colWidth = 39; // Width of each barcode (adjust as needed)
        const maxColsPerPage = 5; // Maximum number of columns per page
        const maxRowsPerPage = 15; // Maximum number of rows per page

        let currentRow = 0; // Current row on the PDF page
        let currentCol = 0; // Current column on the PDF page

        // Promises array to track image conversion
        const promises = [];

        serialNumbers.forEach((serialNumber, index) => {
            const promise = new Promise((resolve, reject) => {
                // Adjust scale to capture high-resolution PNG
                const scale = 7; // Increase scale for higher resolution

                domtoimage
                    .toPng(barcodeRefs.current[index], {
                        quality: 1,
                        width: colWidth * scale,
                        height: rowHeight * scale
                    })
                    .then((dataUrl) => {
                        // Calculate positions on PDF page
                        const x = 15 + currentCol * colWidth;
                        const y = 20 + currentRow * rowHeight;

                        // Add PNG image to PDF
                        doc.addImage(dataUrl, 'PNG', x, y, colWidth, rowHeight, '', 'FAST');

                        // Move to the next column and row
                        currentCol++;
                        if (currentCol >= maxColsPerPage) {
                            currentCol = 0;
                            currentRow++;
                        }
                        if (currentRow >= maxRowsPerPage) {
                            currentRow = 0;
                            doc.addPage();
                        }

                        // Resolve promise after adding image
                        resolve();
                    })
                    .catch((error) => {
                        console.error('Error generating PDF:', error);
                        reject(error); // Reject promise if there's an error
                    });
            });

            promises.push(promise); // Push promise to promises array
        });

        // Wait for all promises to resolve before saving PDF
        Promise.all(promises)
            .then(() => {
                // Save the PDF after all images are added
                doc.save(
                    `generated_barcodes-${moment(Date.now()).format('MM-D-YYYY-h:mm:ss-a')}.pdf`
                );
            })
            .catch((error) => {
                console.error('Error generating PDF:', error);
            });
    };

    return (
        <div className='max-w-lg mx-auto mt-8 p-4 bg-white rounded-lg shadow-lg'>
            <h2 className='text-2xl font-bold mb-4'>Generate Barcodes</h2>
            <div className='flex justify-center items-center mb-4'>
                <label htmlFor='quantityInput' className='mr-2'>
                    Quantity:
                </label>
                <input
                    id='quantityInput'
                    type='number'
                    min='1'
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className='px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500'
                />
            </div>
            <div className='flex justify-center items-center mb-4'>
                <label htmlFor='companyNameInput' className='mr-2'>
                    Company Name:
                </label>
                <input
                    id='companyNameInput'
                    type='text'
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className='px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500'
                />
            </div>
            <button
                onClick={generateSerialNumbers}
                className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none mr-2'
            >
                Generate Barcodes
            </button>
            {serialNumbers.length > 0 && (
                <button
                    onClick={generatePDF}
                    className='px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none'
                >
                    Generate PDF
                </button>
            )}

            <div className='mt-8 flex justify-center flex-col items-center'>
                {serialNumbers.map((serialNumber, index) => (
                    <div
                        key={index}
                        ref={(el) => (barcodeRefs.current[index] = el)}
                        id={`barcode-${index}`}
                    >
                        <p className='font-bold border-b-transparent w-[266px]'>{companyName}</p>
                        <Barcode
                            value={serialNumber.toString()}
                            width={2}
                            height={30}
                            className=''
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SerialNumberWithBarcode;
