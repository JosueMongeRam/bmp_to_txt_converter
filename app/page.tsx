"use client";
import React, { useRef, useState } from "react";

export default function Home() {
  // Cambia el estado inicial para que use la URL de la imagen por defecto
  const [image, setImage] = useState<string>("/images/image.gif");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const colorMap: { [key: string]: string } = {
    "#000000": "0", // Negro
    "#aa0000": "4", // Rojo
    "#808080": "8", // Gris
    "#ff5555": "C", // Rojo claro
    "#0000aa": "1", // Azul
    "#aa00aa": "5", // Magenta
    "#5555ff": "9", // Azul claro
    "#ff55ff": "D", // Magenta claro
    "#00aa00": "2", // Verde
    "#aa5500": "6", // Marrón
    "#55ff55": "A", // Verde claro
    "#ffff55": "E", // Amarillo
    "#00aaaa": "3", // Cian
    "#aaaaaa": "7", // Blanco opaco
    "#55ffff": "B", // Celeste claro
    "#ffffff": "F", // Blanco brillante
  };

  const colorDifference = (
    color1: [number, number, number],
    color2: [number, number, number]
  ) => {
    return Math.sqrt(
      Math.pow(color1[0] - color2[0], 2) +
        Math.pow(color1[1] - color2[1], 2) +
        Math.pow(color1[2] - color2[2], 2)
    );
  };

  const findClosestColor = (r: number, g: number, b: number) => {
    let closestColor = "#000000";
    let smallestDifference = Infinity;

    for (const hex in colorMap) {
      const r2 = parseInt(hex.substring(1, 3), 16);
      const g2 = parseInt(hex.substring(3, 5), 16);
      const b2 = parseInt(hex.substring(5, 7), 16);

      const difference = colorDifference([r, g, b], [r2, g2, b2]);

      if (difference < smallestDifference) {
        smallestDifference = difference;
        closestColor = hex;
      }
    }

    return closestColor;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleConvertClick = () => {
    if (canvasRef.current && image) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const img = new Image();
      img.src = image;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        const imageData = ctx?.getImageData(0, 0, img.width, img.height);
        const pixels = imageData?.data;

        if (pixels) {
          let result = "";

          // Procesamos los píxeles fila por fila y columna por columna
          for (let y = 0; y < img.height; y++) {
            for (let x = 0; x < img.width; x++) {
              const index = (y * img.width + x) * 4; // Cada píxel tiene 4 valores (RGBA)
              const r = pixels[index];
              const g = pixels[index + 1];
              const b = pixels[index + 2];

              // Buscar el color más cercano
              const closestHexColor = findClosestColor(r, g, b).toLowerCase();

              // Mapear el color más cercano a un carácter
              const char = colorMap[closestHexColor] || "?";
              result += char;
            }

            // Añadimos "@" al final de cada fila
            result += "@";
          }

          // Añadimos "%" al final del archivo
          result += "%";

          downloadTextFile(result);
        }
      };
    }
  };

  const downloadTextFile = (text: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "image.txt";
    link.click();
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={
        "flex flex-col justify-center space-y-4 pt-9 items-center bg-black w-full h-screen max-h-screen text-white text-2xl"
      }
    >
      <h1 className="text-white text-4xl font-bold italic">
        Welcome to the BMP 16 bit image to TEXT converter
      </h1>
      <div className={"flex flex-row space-x-9 "}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/bmp"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <button
          className="bg-blue-500 text-white p-2 rounded"
          onClick={handleButtonClick}
        >
          Select image
        </button>
        <button
          className="bg-blue-500 text-white p-2 rounded"
          onClick={handleConvertClick}
        >
          Convert image
        </button>
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      <div className={"flex justify-center items-start"}>
        <img
          className="size-96 object-cover"
          src={image}
          alt="Default GIF"
          style={{ maxWidth: '100%', maxHeight: '400px' }} // Ajusta el tamaño de la imagen
        />
      </div>
      <p className="font-bold italic">The image must be in BMP 16 bit format</p>
      <div className="flex justify-center items-center flex-col h-1/4 pb-4">
        <p className="font-bold italic">Made by Josue Monge R</p>
        <p className="font-bold italic">Architecture 2024</p>
      </div>
    </div>
  );
}
