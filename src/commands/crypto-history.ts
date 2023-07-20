import axios from "axios";
import { CommandConfig } from "@roboplay/robo.js";
import { ChannelType, CommandInteraction } from "discord.js";

import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import fs from "fs-extra";

export const config: CommandConfig = {
  description: "Display prices history of a specific crypto",
  options: [
    {
      description: "What is the crypto name?",
      name: "crypto",
      required: true,
    },
    {
      description: "Where should I send the message to?",
      name: "channel",
      type: "channel",
    },
  ],
};

const getHistoricalPrices = async (
  coin: string,
  days: string
): Promise<[number[], string[]]> => {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days}`
    );

    // if (!response.ok) throw new Error("Failed to fetch ;(");

    const data = response.data;

    const priceData = data.prices;
    const dateAxis: string[] = [];
    const pricesAxis: number[] = [];

    const formattedPriceData = priceData.map(
      ([timestamp, price]: [any, any]) => {
        const date = new Date(timestamp);

        let hours = date.getHours();
        const minutes = date.getMinutes();
        let period = "am";

        if (hours >= 12) {
          period = "pm";

          if (hours > 12) {
            hours -= 12;
          }
        }

        // ? Check the days to convert the dateAxis to dates or hours :3

        dateAxis.push(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")} ${period}`
        );
        pricesAxis.push(price);
      }
    );

    return [pricesAxis, dateAxis];
  } catch (err) {
    if (err instanceof Error) {
      throw new Error("You don't know crypto names? OwO");
    }
  }
};

async function generateBarChart(pricesAxis: number[], dateAxis: string[]) {
  // Configuration options for the bar chart
  const configuration = {
    type: "line",
    data: {
      labels: dateAxis,
      datasets: [
        {
          label: "Prices",
          data: pricesAxis,
          borderColor: "#d8d8d8",
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
        },
      ],
    },
    options: {
      // ...
      plugins: {
        title: {
          display: false,
          text: "Line Chart",
          color: "#fcd535",
        },
        legend: {
          display: false,
          labels: {
            color: "blue",
          },
        },
        tooltip: {
          enabled: true,
          mode: "nearest",
          intersect: false,
        },
      },

      scales: {
        x: {
          grid: {
            display: true,
            color: "#181a20",
          },
          ticks: {
            // color: '#fcd535',
          },
        },
        y: {
          grid: {
            display: true,
            color: "#181a20",
          },
          ticks: {
            // color: '#fcd535',
          },
        },
      },
    },
  };

  const canvasRenderService = new ChartJSNodeCanvas({
    width: 1000,
    height: 600,
  });

  const imageBuffer = await canvasRenderService.renderToBuffer(configuration);

  await fs.writeFileSync("barchart.png", imageBuffer);
}

export default async (interaction: CommandInteraction) => {
  const crypto = interaction.options._hoistedOptions[0].value as string;
  const channel =
    interaction.options.get("channel")?.channel ?? interaction.channel;

  if (!crypto?.trim()) {
    return "You need to provide a message to send!";
  }
  if (channel?.type !== ChannelType.GuildText || !("send" in channel)) {
    return "The specified channel is not a text channel.";
  }

  const [pricesAxis, dateAxis] = await getHistoricalPrices(crypto, "1");

  await generateBarChart(pricesAxis, dateAxis);

  const imageBuffer = await fs.readFile("barchart.png");

  await channel.send({
    files: [
      {
        attachment: imageBuffer,
        name: "barchart.png",
      },
    ],
  });

  return `Here's ***${
    crypto.charAt(0).toUpperCase() + crypto.slice(1)
  }***'s price history in USD during the last ${"24 hours (for now :3)"}`;
};
