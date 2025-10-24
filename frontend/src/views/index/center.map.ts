//mapData数据结构
export interface MapdataType {
  name: string;
  value: [number, number, number]; //x,y,value  第一个x 第二个y  第三个value
}
export const optionHandle = (regionCode: string, list: object[], mapData: MapdataType[]) => {
  let top = 45;
  let zoom = ["china"].includes(regionCode) ? 1.05 : 1;
  return {
    backgroundColor: "rgba(0,0,0,0)",
    tooltip: {
      show: false,
    },
    legend: {
      show: false,
    },
     visualMap: {
       seriesIndex: 0,
       left: 20,
       bottom: 20,
       pieces: [
         { gte: 500, label: "500以上" },
         { gte: 400, lte: 499, label: "400-499" },
         { gte: 300, lte: 399, label: "300-399" },
         { gte: 200, lte: 249, label: "200-249" },
         { gte: 100, lte: 199, label: "100-199" },
         { lte: 59, label: "59以下" },
       ],
      inRange: {
        // 渐变颜色，从小到大
        // FFFFFF,EDF7FD,DBF0FA,C9E8F8,B7E1F6,A5D9F3,93D2F1,81CAEF,6FC2EC,5DBBEA,4AB3E8,38ACE5,26A4E3,1C9AD9,1A8DC7,
        // 1781B5,
        // 1573A2,136790,105A7E,0E4D6C,0C405A,093348,072636,051A24,020D12
        color: [
          // "#EDF7FD",
          "rgba(237,247,253,.2)",
          // "#B7E1F6",
          "rgba(183,225,246,.2)",
          // "#81CAEF",
          "rgba(129,202,239,.2)",
          // "#38ACE5",
          "rgba(56,172,229,.2)",
          // "#1781B5",
          "rgba(23,129,181,.2)",
          // "#105A7E",
          "rgba(16,90,126,0.5)",
        ],
      },
      textStyle: {
        color: "#fff",
      },
    },
    geo: [
      {
        map: regionCode,
        roam: false,
        selectedMode: false, //是否允许选中多个区域
        zoom: zoom,
        top: top,
        aspectScale: 0.78,
        show: false,
      },
    ],
    series: [
      {
        name: "MAP",
        type: "map",
        map: regionCode,
        aspectScale: 0.78,
        data: list,
        showLegendSymbol: false, // 禁用默认标记点
        selectedMode: false, //是否允许选中多个区域
        zoom: zoom,
        geoIndex: 2,
        top: top,
        tooltip: {
          show: true,
          formatter: function (params: any) {
            if (params.data) {
              return params.name + "：" + params.data["value"];
            } else {
              return params.name;
            }
          },
          backgroundColor: "rgba(0,0,0,.6)",
          borderColor: "rgba(147, 235, 248, .8)",
          textStyle: {
            color: "#FFF",
          },
        },

        label: {
          color: "#000",
          // position: [-10, 0],
          formatter: function (val: any) {
            // console.log(val)
            if (val.data !== undefined) {
              return val.name.slice(0, 2);
            } else {
              return "";
            }
          },
          rich: {},
        },

        emphasis: {
          show: false,
          label: {
            show: false,
          },
          itemStyle: {
            // areaColor: "rgba(56,155,183,.7)",
            areaColor: {
              type: "radial",
              x: 0.5,
              y: 0.5,
              r: 0.8,
              colorStops: [
                {
                  offset: 0,
                  color: "rgba(147, 235, 248, 0)", // 0% 处的颜色
                },
                {
                  offset: 1,
                  color: "rgba(56,155,183, .8)", // 100% 处的颜色
                },
              ],
              globalCoord: false, // 缺为 false
            },
            borderWidth: 1,
          },
        },
        itemStyle: {
          borderColor: "rgba(147, 235, 248, .8)",
          borderWidth: 1,
          areaColor: {
            type: "radial",
            x: 0.5,
            y: 0.5,
            r: 0.8,
            colorStops: [
              {
                offset: 0,
                color: "rgba(147, 235, 248, 0)", // 0% 处的颜色
              },
              {
                offset: 1,
                color: "rgba(147, 235, 248, .2)", // 100% 处的颜色
              },
            ],
            globalCoord: false, // 缺为 false
          },
          shadowColor: "rgba(128, 217, 248, .3)",
          shadowOffsetX: -2,
          shadowOffsetY: 2,
          shadowBlur: 10,
        },
      },
        {
          data: mapData,
          type: "effectScatter",
          coordinateSystem: "geo",
          symbolSize: function (val: any) {
            return 3; // 减小圆点大小，更精致
            // return val[2] / 50;
          },
          legendHoverLink: true,
          showEffectOn: "render",
          rippleEffect: {
            period: 4, // 增加波纹周期，减慢动画
            scale: 4, // 减小波纹范围，从6减到4
            color: "rgba(255,255,255, 0.8)", // 降低波纹透明度
            brushType: "fill",
          },
          tooltip: {
            show: true,
            formatter: function (params: any) {
              if (params.data) {
                return params.name + "：" + params.data["value"][2];
              } else {
                return params.name;
              }
            },
            backgroundColor: "rgba(0,0,0,.6)",
            borderColor: "rgba(147, 235, 248, .8)",
            textStyle: {
              color: "#FFF",
            },
          },
          label: {
            formatter: (param: any) => {
              return param.name.slice(0, 2);
            },

            fontSize: 10, // 稍微增大字体
            offset: [0, 8], // 增加偏移量，让标签距离圆点更远（从2增加到8）
            position: "bottom",
            textBorderColor: "#000", // 改为黑色描边，对比更明显
            textShadowColor: "#000",
            textShadowBlur: 10,
            textBorderWidth: 1, // 增加描边宽度
            color: "#FFF",
            show: true,
          },
          // colorBy: "data",
          itemStyle: {
            color: "rgba(255,255,255,0.9)", // 略微降低圆点透明度
            borderColor: "rgba(255,255,255,0.5)", // 调整边框透明度
            borderWidth: 2, // 减小边框宽度，从4减到2
            shadowColor: "#000",
            shadowBlur: 10, // 减小阴影范围
          },
        },
    ],
    //动画效果
    // animationDuration: 1000,
    // animationEasing: 'linear',
    // animationDurationUpdate: 1000
  };
};

export const regionCodes: any = {
  中国: {
    adcode: "100000",
    level: "country",
    name: "中华人民共和国",
  },
  新疆维吾尔自治区: {
    adcode: "650000",
    level: "province",
    name: "新疆维吾尔自治区",
  },
  湖北省: {
    adcode: "420000",
    level: "province",
    name: "湖北省",
  },
  辽宁省: {
    adcode: "210000",
    level: "province",
    name: "辽宁省",
  },
  广东省: {
    adcode: "440000",
    level: "province",
    name: "广东省",
  },
  内蒙古自治区: {
    adcode: "150000",
    level: "province",
    name: "内蒙古自治区",
  },
  黑龙江省: {
    adcode: "230000",
    level: "province",
    name: "黑龙江省",
  },
  河南省: {
    adcode: "410000",
    level: "province",
    name: "河南省",
  },
  山东省: {
    adcode: "370000",
    level: "province",
    name: "山东省",
  },
  陕西省: {
    adcode: "610000",
    level: "province",
    name: "陕西省",
  },
  贵州省: {
    adcode: "520000",
    level: "province",
    name: "贵州省",
  },
  上海市: {
    adcode: "310000",
    level: "province",
    name: "上海市",
  },
  重庆市: {
    adcode: "500000",
    level: "province",
    name: "重庆市",
  },
  西藏自治区: {
    adcode: "540000",
    level: "province",
    name: "西藏自治区",
  },
  安徽省: {
    adcode: "340000",
    level: "province",
    name: "安徽省",
  },
  福建省: {
    adcode: "350000",
    level: "province",
    name: "福建省",
  },
  湖南省: {
    adcode: "430000",
    level: "province",
    name: "湖南省",
  },
  海南省: {
    adcode: "460000",
    level: "province",
    name: "海南省",
  },
  江苏省: {
    adcode: "320000",
    level: "province",
    name: "江苏省",
  },
  青海省: {
    adcode: "630000",
    level: "province",
    name: "青海省",
  },
  广西壮族自治区: {
    adcode: "450000",
    level: "province",
    name: "广西壮族自治区",
  },
  宁夏回族自治区: {
    adcode: "640000",
    level: "province",
    name: "宁夏回族自治区",
  },
  浙江省: {
    adcode: "330000",
    level: "province",
    name: "浙江省",
  },
  河北省: {
    adcode: "130000",
    level: "province",
    name: "河北省",
  },
  香港特别行政区: {
    adcode: "810000",
    level: "province",
    name: "香港特别行政区",
  },
  台湾省: {
    adcode: "710000",
    level: "province",
    name: "台湾省",
  },
  澳门特别行政区: {
    adcode: "820000",
    level: "province",
    name: "澳门特别行政区",
  },
  甘肃省: {
    adcode: "620000",
    level: "province",
    name: "甘肃省",
  },
  四川省: {
    adcode: "510000",
    level: "province",
    name: "四川省",
  },
  天津市: {
    adcode: "120000",
    level: "province",
    name: "天津市",
  },
  江西省: {
    adcode: "360000",
    level: "province",
    name: "江西省",
  },
  云南省: {
    adcode: "530000",
    level: "province",
    name: "云南省",
  },
  山西省: {
    adcode: "140000",
    level: "province",
    name: "山西省",
  },
  北京市: {
    adcode: "110000",
    level: "province",
    name: "北京市",
  },
  吉林省: {
    adcode: "220000",
    level: "province",
    name: "吉林省",
  },
};
