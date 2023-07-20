import axios from "axios";
import { ChannelType } from "discord.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import fs from "fs-extra";
export const config = {
    description: "Display prices history of a specific crypto",
    options: [
        {
            description: "What is the crypto name?",
            name: "crypto",
            required: true
        },
        {
            description: "Where should I send the message to?",
            name: "channel",
            type: "channel"
        }
    ]
};
const getHistoricalPrices = async (coin, days)=>{
    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days}`);
        // if (!response.ok) throw new Error("Failed to fetch ;(");
        const data = response.data;
        const priceData = data.prices;
        const dateAxis = [];
        const pricesAxis = [];
        const formattedPriceData = priceData.map(([timestamp, price])=>{
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
            dateAxis.push(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`);
            pricesAxis.push(price);
        });
        return [
            pricesAxis,
            dateAxis
        ];
    } catch (err) {
        if (err instanceof Error) {
            throw new Error("You don't know crypto names? OwO");
        }
    }
};
async function generateBarChart(pricesAxis, dateAxis) {
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
                    pointRadius: 0
                }
            ]
        },
        options: {
            // ...
            plugins: {
                title: {
                    display: false,
                    text: "Line Chart",
                    color: "#fcd535"
                },
                legend: {
                    display: false,
                    labels: {
                        color: "blue"
                    }
                },
                tooltip: {
                    enabled: true,
                    mode: "nearest",
                    intersect: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: true,
                        color: "#181a20"
                    },
                    ticks: {
                    }
                },
                y: {
                    grid: {
                        display: true,
                        color: "#181a20"
                    },
                    ticks: {
                    }
                }
            }
        }
    };
    const canvasRenderService = new ChartJSNodeCanvas({
        width: 1000,
        height: 600
    });
    const imageBuffer = await canvasRenderService.renderToBuffer(configuration);
    await fs.writeFileSync("barchart.png", imageBuffer);
}
export default (async (interaction)=>{
    const crypto = interaction.options._hoistedOptions[0].value;
    const channel = interaction.options.get("channel")?.channel ?? interaction.channel;
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
                name: "barchart.png"
            }
        ]
    });
    return `Here's ***${crypto.charAt(0).toUpperCase() + crypto.slice(1)}***'s price history in USD during the last ${"24 hours (for now :3)"}`;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkU6XFxQcm9ncmFtbWluZ1xcUHJvamVjdHNcXFJvYm9QbGF5IFBsdWdpbnNcXGNyeXB0by1wcmljZS1oaXN0b3J5XFxjcnlwdG8tcHJpY2UtaGlzdG9yeVxcc3JjXFxjb21tYW5kc1xcY3J5cHRvLWhpc3RvcnkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xyXG5pbXBvcnQgeyBDb21tYW5kQ29uZmlnIH0gZnJvbSBcIkByb2JvcGxheS9yb2JvLmpzXCI7XHJcbmltcG9ydCB7IENoYW5uZWxUeXBlLCBDb21tYW5kSW50ZXJhY3Rpb24gfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xyXG5cclxuaW1wb3J0IHsgQ2hhcnRKU05vZGVDYW52YXMgfSBmcm9tIFwiY2hhcnRqcy1ub2RlLWNhbnZhc1wiO1xyXG5pbXBvcnQgZnMgZnJvbSBcImZzLWV4dHJhXCI7XHJcblxyXG5leHBvcnQgY29uc3QgY29uZmlnOiBDb21tYW5kQ29uZmlnID0ge1xyXG4gIGRlc2NyaXB0aW9uOiBcIkRpc3BsYXkgcHJpY2VzIGhpc3Rvcnkgb2YgYSBzcGVjaWZpYyBjcnlwdG9cIixcclxuICBvcHRpb25zOiBbXHJcbiAgICB7XHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIldoYXQgaXMgdGhlIGNyeXB0byBuYW1lP1wiLFxyXG4gICAgICBuYW1lOiBcImNyeXB0b1wiLFxyXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIldoZXJlIHNob3VsZCBJIHNlbmQgdGhlIG1lc3NhZ2UgdG8/XCIsXHJcbiAgICAgIG5hbWU6IFwiY2hhbm5lbFwiLFxyXG4gICAgICB0eXBlOiBcImNoYW5uZWxcIixcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmNvbnN0IGdldEhpc3RvcmljYWxQcmljZXMgPSBhc3luYyAoXHJcbiAgY29pbjogc3RyaW5nLFxyXG4gIGRheXM6IHN0cmluZ1xyXG4pOiBQcm9taXNlPFtudW1iZXJbXSwgc3RyaW5nW11dPiA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0KFxyXG4gICAgICBgaHR0cHM6Ly9hcGkuY29pbmdlY2tvLmNvbS9hcGkvdjMvY29pbnMvJHtjb2lufS9tYXJrZXRfY2hhcnQ/dnNfY3VycmVuY3k9dXNkJmRheXM9JHtkYXlzfWBcclxuICAgICk7XHJcblxyXG4gICAgLy8gaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGZldGNoIDsoXCIpO1xyXG5cclxuICAgIGNvbnN0IGRhdGEgPSByZXNwb25zZS5kYXRhO1xyXG5cclxuICAgIGNvbnN0IHByaWNlRGF0YSA9IGRhdGEucHJpY2VzO1xyXG4gICAgY29uc3QgZGF0ZUF4aXM6IHN0cmluZ1tdID0gW107XHJcbiAgICBjb25zdCBwcmljZXNBeGlzOiBudW1iZXJbXSA9IFtdO1xyXG5cclxuICAgIGNvbnN0IGZvcm1hdHRlZFByaWNlRGF0YSA9IHByaWNlRGF0YS5tYXAoXHJcbiAgICAgIChbdGltZXN0YW1wLCBwcmljZV06IFthbnksIGFueV0pID0+IHtcclxuICAgICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUodGltZXN0YW1wKTtcclxuXHJcbiAgICAgICAgbGV0IGhvdXJzID0gZGF0ZS5nZXRIb3VycygpO1xyXG4gICAgICAgIGNvbnN0IG1pbnV0ZXMgPSBkYXRlLmdldE1pbnV0ZXMoKTtcclxuICAgICAgICBsZXQgcGVyaW9kID0gXCJhbVwiO1xyXG5cclxuICAgICAgICBpZiAoaG91cnMgPj0gMTIpIHtcclxuICAgICAgICAgIHBlcmlvZCA9IFwicG1cIjtcclxuXHJcbiAgICAgICAgICBpZiAoaG91cnMgPiAxMikge1xyXG4gICAgICAgICAgICBob3VycyAtPSAxMjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vID8gQ2hlY2sgdGhlIGRheXMgdG8gY29udmVydCB0aGUgZGF0ZUF4aXMgdG8gZGF0ZXMgb3IgaG91cnMgOjNcclxuXHJcbiAgICAgICAgZGF0ZUF4aXMucHVzaChcclxuICAgICAgICAgIGAke2hvdXJzLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgXCIwXCIpfToke21pbnV0ZXNcclxuICAgICAgICAgICAgLnRvU3RyaW5nKClcclxuICAgICAgICAgICAgLnBhZFN0YXJ0KDIsIFwiMFwiKX0gJHtwZXJpb2R9YFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgcHJpY2VzQXhpcy5wdXNoKHByaWNlKTtcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICByZXR1cm4gW3ByaWNlc0F4aXMsIGRhdGVBeGlzXTtcclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIGlmIChlcnIgaW5zdGFuY2VvZiBFcnJvcikge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgZG9uJ3Qga25vdyBjcnlwdG8gbmFtZXM/IE93T1wiKTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZUJhckNoYXJ0KHByaWNlc0F4aXM6IG51bWJlcltdLCBkYXRlQXhpczogc3RyaW5nW10pIHtcclxuICAvLyBDb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZSBiYXIgY2hhcnRcclxuICBjb25zdCBjb25maWd1cmF0aW9uID0ge1xyXG4gICAgdHlwZTogXCJsaW5lXCIsXHJcbiAgICBkYXRhOiB7XHJcbiAgICAgIGxhYmVsczogZGF0ZUF4aXMsXHJcbiAgICAgIGRhdGFzZXRzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbGFiZWw6IFwiUHJpY2VzXCIsXHJcbiAgICAgICAgICBkYXRhOiBwcmljZXNBeGlzLFxyXG4gICAgICAgICAgYm9yZGVyQ29sb3I6IFwiI2Q4ZDhkOFwiLFxyXG4gICAgICAgICAgYm9yZGVyV2lkdGg6IDIsXHJcbiAgICAgICAgICBmaWxsOiBmYWxzZSxcclxuICAgICAgICAgIHBvaW50UmFkaXVzOiAwLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9LFxyXG4gICAgb3B0aW9uczoge1xyXG4gICAgICAvLyAuLi5cclxuICAgICAgcGx1Z2luczoge1xyXG4gICAgICAgIHRpdGxlOiB7XHJcbiAgICAgICAgICBkaXNwbGF5OiBmYWxzZSxcclxuICAgICAgICAgIHRleHQ6IFwiTGluZSBDaGFydFwiLFxyXG4gICAgICAgICAgY29sb3I6IFwiI2ZjZDUzNVwiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbGVnZW5kOiB7XHJcbiAgICAgICAgICBkaXNwbGF5OiBmYWxzZSxcclxuICAgICAgICAgIGxhYmVsczoge1xyXG4gICAgICAgICAgICBjb2xvcjogXCJibHVlXCIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdG9vbHRpcDoge1xyXG4gICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICAgIG1vZGU6IFwibmVhcmVzdFwiLFxyXG4gICAgICAgICAgaW50ZXJzZWN0OiBmYWxzZSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG5cclxuICAgICAgc2NhbGVzOiB7XHJcbiAgICAgICAgeDoge1xyXG4gICAgICAgICAgZ3JpZDoge1xyXG4gICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICBjb2xvcjogXCIjMTgxYTIwXCIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgdGlja3M6IHtcclxuICAgICAgICAgICAgLy8gY29sb3I6ICcjZmNkNTM1JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICB5OiB7XHJcbiAgICAgICAgICBncmlkOiB7XHJcbiAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXHJcbiAgICAgICAgICAgIGNvbG9yOiBcIiMxODFhMjBcIixcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB0aWNrczoge1xyXG4gICAgICAgICAgICAvLyBjb2xvcjogJyNmY2Q1MzUnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9O1xyXG5cclxuICBjb25zdCBjYW52YXNSZW5kZXJTZXJ2aWNlID0gbmV3IENoYXJ0SlNOb2RlQ2FudmFzKHtcclxuICAgIHdpZHRoOiAxMDAwLFxyXG4gICAgaGVpZ2h0OiA2MDAsXHJcbiAgfSk7XHJcblxyXG4gIGNvbnN0IGltYWdlQnVmZmVyID0gYXdhaXQgY2FudmFzUmVuZGVyU2VydmljZS5yZW5kZXJUb0J1ZmZlcihjb25maWd1cmF0aW9uKTtcclxuXHJcbiAgYXdhaXQgZnMud3JpdGVGaWxlU3luYyhcImJhcmNoYXJ0LnBuZ1wiLCBpbWFnZUJ1ZmZlcik7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGFzeW5jIChpbnRlcmFjdGlvbjogQ29tbWFuZEludGVyYWN0aW9uKSA9PiB7XHJcbiAgY29uc3QgY3J5cHRvID0gaW50ZXJhY3Rpb24ub3B0aW9ucy5faG9pc3RlZE9wdGlvbnNbMF0udmFsdWUgYXMgc3RyaW5nO1xyXG4gIGNvbnN0IGNoYW5uZWwgPVxyXG4gICAgaW50ZXJhY3Rpb24ub3B0aW9ucy5nZXQoXCJjaGFubmVsXCIpPy5jaGFubmVsID8/IGludGVyYWN0aW9uLmNoYW5uZWw7XHJcblxyXG4gIGlmICghY3J5cHRvPy50cmltKCkpIHtcclxuICAgIHJldHVybiBcIllvdSBuZWVkIHRvIHByb3ZpZGUgYSBtZXNzYWdlIHRvIHNlbmQhXCI7XHJcbiAgfVxyXG4gIGlmIChjaGFubmVsPy50eXBlICE9PSBDaGFubmVsVHlwZS5HdWlsZFRleHQgfHwgIShcInNlbmRcIiBpbiBjaGFubmVsKSkge1xyXG4gICAgcmV0dXJuIFwiVGhlIHNwZWNpZmllZCBjaGFubmVsIGlzIG5vdCBhIHRleHQgY2hhbm5lbC5cIjtcclxuICB9XHJcblxyXG4gIGNvbnN0IFtwcmljZXNBeGlzLCBkYXRlQXhpc10gPSBhd2FpdCBnZXRIaXN0b3JpY2FsUHJpY2VzKGNyeXB0bywgXCIxXCIpO1xyXG5cclxuICBhd2FpdCBnZW5lcmF0ZUJhckNoYXJ0KHByaWNlc0F4aXMsIGRhdGVBeGlzKTtcclxuXHJcbiAgY29uc3QgaW1hZ2VCdWZmZXIgPSBhd2FpdCBmcy5yZWFkRmlsZShcImJhcmNoYXJ0LnBuZ1wiKTtcclxuXHJcbiAgYXdhaXQgY2hhbm5lbC5zZW5kKHtcclxuICAgIGZpbGVzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICBhdHRhY2htZW50OiBpbWFnZUJ1ZmZlcixcclxuICAgICAgICBuYW1lOiBcImJhcmNoYXJ0LnBuZ1wiLFxyXG4gICAgICB9LFxyXG4gICAgXSxcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIGBIZXJlJ3MgKioqJHtcclxuICAgIGNyeXB0by5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGNyeXB0by5zbGljZSgxKVxyXG4gIH0qKioncyBwcmljZSBoaXN0b3J5IGluIFVTRCBkdXJpbmcgdGhlIGxhc3QgJHtcIjI0IGhvdXJzIChmb3Igbm93IDozKVwifWA7XHJcbn07XHJcbiJdLCJuYW1lcyI6WyJheGlvcyIsIkNoYW5uZWxUeXBlIiwiQ2hhcnRKU05vZGVDYW52YXMiLCJmcyIsImNvbmZpZyIsImRlc2NyaXB0aW9uIiwib3B0aW9ucyIsIm5hbWUiLCJyZXF1aXJlZCIsInR5cGUiLCJnZXRIaXN0b3JpY2FsUHJpY2VzIiwiY29pbiIsImRheXMiLCJyZXNwb25zZSIsImdldCIsImRhdGEiLCJwcmljZURhdGEiLCJwcmljZXMiLCJkYXRlQXhpcyIsInByaWNlc0F4aXMiLCJmb3JtYXR0ZWRQcmljZURhdGEiLCJtYXAiLCJ0aW1lc3RhbXAiLCJwcmljZSIsImRhdGUiLCJEYXRlIiwiaG91cnMiLCJnZXRIb3VycyIsIm1pbnV0ZXMiLCJnZXRNaW51dGVzIiwicGVyaW9kIiwicHVzaCIsInRvU3RyaW5nIiwicGFkU3RhcnQiLCJlcnIiLCJFcnJvciIsImdlbmVyYXRlQmFyQ2hhcnQiLCJjb25maWd1cmF0aW9uIiwibGFiZWxzIiwiZGF0YXNldHMiLCJsYWJlbCIsImJvcmRlckNvbG9yIiwiYm9yZGVyV2lkdGgiLCJmaWxsIiwicG9pbnRSYWRpdXMiLCJwbHVnaW5zIiwidGl0bGUiLCJkaXNwbGF5IiwidGV4dCIsImNvbG9yIiwibGVnZW5kIiwidG9vbHRpcCIsImVuYWJsZWQiLCJtb2RlIiwiaW50ZXJzZWN0Iiwic2NhbGVzIiwieCIsImdyaWQiLCJ0aWNrcyIsInkiLCJjYW52YXNSZW5kZXJTZXJ2aWNlIiwid2lkdGgiLCJoZWlnaHQiLCJpbWFnZUJ1ZmZlciIsInJlbmRlclRvQnVmZmVyIiwid3JpdGVGaWxlU3luYyIsImludGVyYWN0aW9uIiwiY3J5cHRvIiwiX2hvaXN0ZWRPcHRpb25zIiwidmFsdWUiLCJjaGFubmVsIiwidHJpbSIsIkd1aWxkVGV4dCIsInJlYWRGaWxlIiwic2VuZCIsImZpbGVzIiwiYXR0YWNobWVudCIsImNoYXJBdCIsInRvVXBwZXJDYXNlIiwic2xpY2UiXSwibWFwcGluZ3MiOiJBQUFBLE9BQU9BLFdBQVcsUUFBUTtBQUUxQixTQUFTQyxXQUFXLFFBQTRCLGFBQWE7QUFFN0QsU0FBU0MsaUJBQWlCLFFBQVEsc0JBQXNCO0FBQ3hELE9BQU9DLFFBQVEsV0FBVztBQUUxQixPQUFPLE1BQU1DLFNBQXdCO0lBQ25DQyxhQUFhO0lBQ2JDLFNBQVM7UUFDUDtZQUNFRCxhQUFhO1lBQ2JFLE1BQU07WUFDTkMsVUFBVTtRQUNaO1FBQ0E7WUFDRUgsYUFBYTtZQUNiRSxNQUFNO1lBQ05FLE1BQU07UUFDUjtLQUNEO0FBQ0gsRUFBRTtBQUVGLE1BQU1DLHNCQUFzQixPQUMxQkMsTUFDQUM7SUFFQSxJQUFJO1FBQ0YsTUFBTUMsV0FBVyxNQUFNYixNQUFNYyxHQUFHLENBQzlCLENBQUMsdUNBQXVDLEVBQUVILEtBQUssbUNBQW1DLEVBQUVDLEtBQUssQ0FBQztRQUc1RiwyREFBMkQ7UUFFM0QsTUFBTUcsT0FBT0YsU0FBU0UsSUFBSTtRQUUxQixNQUFNQyxZQUFZRCxLQUFLRSxNQUFNO1FBQzdCLE1BQU1DLFdBQXFCLEVBQUU7UUFDN0IsTUFBTUMsYUFBdUIs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