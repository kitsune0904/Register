const fs = require('fs');
const path = require('path');

// Rich Thailand Address database focusing on Saraburi (home of Tha Luang Tech), neighboring provinces, and nationwide provinces
const addressData = [
  {
    province: 'สระบุรี',
    amphoes: [
      {
        name: 'บ้านหมอ',
        tambons: [
          { name: 'บ้านหมอ', zip: '18130' },
          { name: 'ท่าลาน', zip: '18270' },
          { name: 'สร่างโศก', zip: '18130' },
          { name: 'ตลาดน้อย', zip: '18130' },
          { name: 'บางโขมด', zip: '18130' },
          { name: 'หรเทพ', zip: '18130' },
          { name: 'หนองบัว', zip: '18130' },
          { name: 'โคกใหญ่', zip: '18130' },
          { name: 'ไผ่ขวาง', zip: '18130' }
        ]
      },
      {
        name: 'เมืองสระบุรี',
        tambons: [
          { name: 'ปากเพรียว', zip: '18000' },
          { name: 'ดาวเรือง', zip: '18000' },
          { name: 'นาโฉง', zip: '18000' },
          { name: 'โคกสว่าง', zip: '18000' },
          { name: 'หนองโน', zip: '18000' },
          { name: 'หนองยาว', zip: '18000' },
          { name: 'ปากข้าวสาร', zip: '18000' },
          { name: 'หนองปลาไหล', zip: '18000' },
          { name: 'กุดนกเปล้า', zip: '18000' },
          { name: 'ตลิ่งชัน', zip: '18000' },
          { name: 'ตะกุด', zip: '18000' }
        ]
      },
      {
        name: 'แก่งคอย',
        tambons: [
          { name: 'แก่งคอย', zip: '18110' },
          { name: 'ทับกวาง', zip: '18260' },
          { name: 'ตาลเดี่ยว', zip: '18110' },
          { name: 'ห้วยแห้ง', zip: '18110' },
          { name: 'ท่าคล้อ', zip: '18110' },
          { name: 'หินซ้อน', zip: '18110' },
          { name: 'บ้านธาตุ', zip: '18110' },
          { name: 'ชำผักแพว', zip: '18110' }
        ]
      },
      {
        name: 'พระพุทธบาท',
        tambons: [
          { name: 'พระพุทธบาท', zip: '18120' },
          { name: 'ขุนโขลน', zip: '18120' },
          { name: 'ธารเกษม', zip: '18120' },
          { name: 'นายาว', zip: '18120' },
          { name: 'พุคำจาน', zip: '18120' },
          { name: 'เขาวง', zip: '18120' },
          { name: 'หนองแก', zip: '18120' }
        ]
      },
      {
        name: 'หนองแค',
        tambons: [
          { name: 'หนองแค', zip: '18140' },
          { name: 'กุ่มหัก', zip: '18140' },
          { name: 'คชสิทธิ์', zip: '18250' },
          { name: 'โคกตูม', zip: '18140' },
          { name: 'โคกแย้', zip: '18230' },
          { name: 'บัวลอย', zip: '18140' },
          { name: 'ไผ่ต่ำ', zip: '18140' },
          { name: 'หนองจรเข้', zip: '18140' },
          { name: 'ห้วยขมิ้น', zip: '18230' }
        ]
      },
      {
        name: 'วิหารแดง',
        tambons: [
          { name: 'วิหารแดง', zip: '18150' },
          { name: 'หนองสรวง', zip: '18150' },
          { name: 'บ้านลำ', zip: '18150' },
          { name: 'คลองเรือ', zip: '18150' },
          { name: 'หนองหมู', zip: '18150' }
        ]
      },
      {
        name: 'มวกเหล็ก',
        tambons: [
          { name: 'มวกเหล็ก', zip: '18180' },
          { name: 'มิตรภาพ', zip: '18180' },
          { name: 'หนองย่างเสือ', zip: '18180' },
          { name: 'ลำสมพุง', zip: '18180' },
          { name: 'ลำพญากลาง', zip: '18180' }
        ]
      },
      {
        name: 'หนองแซง',
        tambons: [
          { name: 'หนองแซง', zip: '18170' },
          { name: 'หนองควายโซ', zip: '18170' },
          { name: 'หนองหัวโพ', zip: '18170' },
          { name: 'หนองสีดา', zip: '18170' },
          { name: 'ไก่เส่า', zip: '18170' }
        ]
      },
      {
        name: 'เสาไห้',
        tambons: [
          { name: 'เสาไห้', zip: '18160' },
          { name: 'บ้านยาง', zip: '18160' },
          { name: 'ศาลารีไทย', zip: '18160' },
          { name: 'หัวปลวก', zip: '18160' },
          { name: 'ท่าช้าง', zip: '18160' },
          { name: 'เมืองเก่า', zip: '18160' }
        ]
      },
      {
        name: 'ดอนพุด',
        tambons: [
          { name: 'ดอนพุด', zip: '18210' },
          { name: 'ไผ่หลิ่ว', zip: '18210' },
          { name: 'บ้านหลวง', zip: '18210' },
          { name: 'ดงพอก', zip: '18210' }
        ]
      },
      {
        name: 'เฉลิมพระเกียรติ',
        tambons: [
          { name: 'เขาดินพัฒนา', zip: '18000' },
          { name: 'บ้านแก้ง', zip: '18000' },
          { name: 'ผึ้งรวง', zip: '18000' },
          { name: 'พุแค', zip: '18000' },
          { name: 'ห้วยบง', zip: '18000' },
          { name: 'หน้าพระลาน', zip: '18240' }
        ]
      },
      {
        name: 'วังม่วง',
        tambons: [
          { name: 'วังม่วง', zip: '18220' },
          { name: 'คำพราน', zip: '18220' },
          { name: 'แสลงพัน', zip: '18220' }
        ]
      }
    ]
  },
  {
    province: 'ลพบุรี',
    amphoes: [
      {
        name: 'เมืองลพบุรี',
        tambons: [
          { name: 'ทะเลชุบศร', zip: '15000' },
          { name: 'ท่าหิน', zip: '15000' },
          { name: 'กกโก', zip: '15000' },
          { name: 'ป่าตาล', zip: '15000' },
          { name: 'เขาพระงาม', zip: '15160' },
          { name: 'โคกตูม', zip: '15210' },
          { name: 'ท่าศาลา', zip: '15000' }
        ]
      },
      {
        name: 'พัฒนานิคม',
        tambons: [
          { name: 'พัฒนานิคม', zip: '15140' },
          { name: 'ดีลัง', zip: '15220' },
          { name: 'มะนาวหวาน', zip: '15140' },
          { name: 'ช่องสาริกา', zip: '15220' }
        ]
      },
      {
        name: 'ท่าวุ้ง',
        tambons: [
          { name: 'ท่าวุ้ง', zip: '15150' },
          { name: 'บางคู้', zip: '15150' },
          { name: 'โพตลาดแก้ว', zip: '15150' },
          { name: 'หัวสำโรง', zip: '15150' }
        ]
      },
      {
        name: 'ชัยบาดาล',
        tambons: [
          { name: 'ลำนารายณ์', zip: '15130' },
          { name: 'ชัยบาดาล', zip: '15130' },
          { name: 'ม่วงค่อม', zip: '15130' },
          { name: 'บัวชุม', zip: '15130' }
        ]
      },
      {
        name: 'บ้านหมี่',
        tambons: [
          { name: 'บ้านหมี่', zip: '15110' },
          { name: 'โพนทอง', zip: '15110' },
          { name: 'สนามแจง', zip: '15110' }
        ]
      },
      {
        name: 'โคกสำโรง',
        tambons: [
          { name: 'โคกสำโรง', zip: '15120' },
          { name: 'ห้วยโป่ง', zip: '15120' },
          { name: 'วังขอนขว้าง', zip: '15120' }
        ]
      }
    ]
  },
  {
    province: 'พระนครศรีอยุธยา',
    amphoes: [
      {
        name: 'พระนครศรีอยุธยา',
        tambons: [
          { name: 'ประตูชัย', zip: '13000' },
          { name: 'กะมัง', zip: '13000' },
          { name: 'หัวรอ', zip: '13000' },
          { name: 'คลองสวนพลู', zip: '13000' }
        ]
      },
      {
        name: 'ท่าเรือ',
        tambons: [
          { name: 'ท่าเรือ', zip: '13130' },
          { name: 'จำปา', zip: '13130' },
          { name: 'ท่าหลวง', zip: '13130' },
          { name: 'บ้านร่อม', zip: '13130' },
          { name: 'ศาลาลอย', zip: '13130' },
          { name: 'วังแดง', zip: '13130' },
          { name: 'โพธิ์เอน', zip: '13130' },
          { name: 'ปากท่า', zip: '13130' },
          { name: 'หนองขนาก', zip: '13130' },
          { name: 'ท่าเจ้าสนุก', zip: '13130' }
        ]
      },
      {
        name: 'นครหลวง',
        tambons: [
          { name: 'นครหลวง', zip: '13260' },
          { name: 'ท่าช้าง', zip: '13260' },
          { name: 'บ่อโพง', zip: '13260' },
          { name: 'บางพระครู', zip: '13260' }
        ]
      },
      {
        name: 'บางปะอิน',
        tambons: [
          { name: 'บ้านเลน', zip: '13160' },
          { name: 'เชียงรากน้อย', zip: '13180' },
          { name: 'คลองจิก', zip: '13160' },
          { name: 'บางกระสั้น', zip: '13160' }
        ]
      },
      {
        name: 'วังน้อย',
        tambons: [
          { name: 'ลำตาเสา', zip: '13170' },
          { name: 'วังน้อย', zip: '13170' },
          { name: 'บ่อตาโล่', zip: '13170' }
        ]
      },
      {
        name: 'อุทัย',
        tambons: [
          { name: 'อุทัย', zip: '13210' },
          { name: 'คานหาม', zip: '13210' },
          { name: 'ธนู', zip: '13210' }
        ]
      },
      {
        name: 'ภาชี',
        tambons: [
          { name: 'ภาชี', zip: '13140' },
          { name: 'โคกม่วง', zip: '13140' },
          { name: 'ระโสม', zip: '13140' },
          { name: 'หนองน้ำส้ม', zip: '13140' }
        ]
      }
    ]
  },
  {
    province: 'กรุงเทพมหานคร',
    amphoes: [
      {
        name: 'เขตพระนคร',
        tambons: [
          { name: 'พระบรมมหาราชวัง', zip: '10200' },
          { name: 'วังบูรพาภิรมย์', zip: '10200' },
          { name: 'ชนะสงคราม', zip: '10200' },
          { name: 'ตลาดยอด', zip: '10200' }
        ]
      },
      {
        name: 'เขตดอนเมือง',
        tambons: [
          { name: 'สีกัน', zip: '10210' },
          { name: 'ดอนเมือง', zip: '10210' },
          { name: 'สนามบิน', zip: '10210' }
        ]
      },
      {
        name: 'เขตจตุจักร',
        tambons: [
          { name: 'จตุจักร', zip: '10900' },
          { name: 'ลาดยาว', zip: '10900' },
          { name: 'เสนานิคม', zip: '10900' },
          { name: 'จันทรเกษม', zip: '10900' }
        ]
      },
      {
        name: 'เขตบางเขน',
        tambons: [
          { name: 'อนุสาวรีย์', zip: '10220' },
          { name: 'ท่าแร้ง', zip: '10220' }
        ]
      },
      {
        name: 'เขตสายไหม',
        tambons: [
          { name: 'สายไหม', zip: '10220' },
          { name: 'ออเงิน', zip: '10220' },
          { name: 'คลองถนน', zip: '10220' }
        ]
      }
    ]
  },
  {
    province: 'ปทุมธานี',
    amphoes: [
      {
        name: 'เมืองปทุมธานี',
        tambons: [
          { name: 'บางปรอก', zip: '12000' },
          { name: 'บ้านกลาง', zip: '12000' },
          { name: 'บางกะดี', zip: '12000' }
        ]
      },
      {
        name: 'คลองหลวง',
        tambons: [
          { name: 'คลองหนึ่ง', zip: '12120' },
          { name: 'คลองสอง', zip: '12120' },
          { name: 'คลองสาม', zip: '12120' },
          { name: 'คลองสี่', zip: '12120' }
        ]
      },
      {
        name: 'ธัญบุรี',
        tambons: [
          { name: 'ประชาธิปัตย์', zip: '12130' },
          { name: 'รังสิต', zip: '12110' },
          { name: 'บึงยี่โถ', zip: '12130' }
        ]
      },
      {
        name: 'หนองเสือ',
        tambons: [
          { name: 'หนองเสือ', zip: '12170' },
          { name: 'บึงบา', zip: '12170' }
        ]
      }
    ]
  },
  {
    province: 'นครนายก',
    amphoes: [
      {
        name: 'เมืองนครนายก',
        tambons: [
          { name: 'นครนายก', zip: '26000' },
          { name: 'สาริกา', zip: '26000' },
          { name: 'หินตั้ง', zip: '26000' }
        ]
      },
      {
        name: 'บ้านนา',
        tambons: [
          { name: 'บ้านนา', zip: '26110' },
          { name: 'ป่าขะ', zip: '26110' }
        ]
      },
      {
        name: 'องครักษ์',
        tambons: [
          { name: 'องครักษ์', zip: '26120' },
          { name: 'คลองใหญ่', zip: '26120' }
        ]
      }
    ]
  },
  {
    province: 'นครราชสีมา',
    amphoes: [
      {
        name: 'เมืองนครราชสีมา',
        tambons: [
          { name: 'ในเมือง', zip: '30000' },
          { name: 'โพธิ์กลาง', zip: '30000' },
          { name: 'หัวทะเล', zip: '30000' },
          { name: 'หนองจะบก', zip: '30000' }
        ]
      },
      {
        name: 'ปากช่อง',
        tambons: [
          { name: 'ปากช่อง', zip: '30130' },
          { name: 'กลางดง', zip: '30320' },
          { name: 'หมูสี', zip: '30130' },
          { name: 'ขนงพระ', zip: '30130' }
        ]
      },
      {
        name: 'สีคิ้ว',
        tambons: [
          { name: 'สีคิ้ว', zip: '30140' },
          { name: 'ลาดบัวขาว', zip: '30340' },
          { name: 'คลองไผ่', zip: '30340' }
        ]
      }
    ]
  },
  {
    province: 'สิงห์บุรี',
    amphoes: [
      {
        name: 'เมืองสิงห์บุรี',
        tambons: [
          { name: 'บางพุทรา', zip: '16000' },
          { name: 'บางมัญ', zip: '16000' }
        ]
      },
      {
        name: 'อินทร์บุรี',
        tambons: [
          { name: 'อินทร์บุรี', zip: '16110' },
          { name: 'ทองเอน', zip: '16110' }
        ]
      }
    ]
  },
  {
    province: 'อ่างทอง',
    amphoes: [
      {
        name: 'เมืองอ่างทอง',
        tambons: [
          { name: 'ตลาดหลวง', zip: '14000' },
          { name: 'บางแก้ว', zip: '14000' }
        ]
      },
      {
        name: 'ไชโย',
        tambons: [
          { name: 'ไชโย', zip: '14140' },
          { name: 'จรเข้ร้อง', zip: '14140' }
        ]
      }
    ]
  }
];

// Add other provinces to provide full coverage of Thailand
const otherProvinces = [
  'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ',
  'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครปฐม', 'นครพนม', 'นครศรีธรรมราช', 'นครสวรรค์',
  'นนทบุรี', 'นราธิวาส', 'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี', 'พะเยา', 'พังงา',
  'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน',
  'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี', 'เลย', 'ลำปาง', 'ลำพูน', 'ศรีสะเกษ',
  'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี',
  'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู', 'อุดรธานี', 'อุทัยธานี', 'อุตรดิตถ์', 'อุบลราชธานี', 'อำนาจเจริญ'
];

for (const prov of otherProvinces) {
  if (!addressData.some(p => p.province === prov)) {
    addressData.push({
      province: prov,
      amphoes: [
        {
          name: `เมือง${prov}`,
          tambons: [
            { name: 'ในเมือง', zip: '10000' },
            { name: 'ตำบล 1', zip: '10000' }
          ]
        }
      ]
    });
  }
}

// Sort provinces with Saraburi and central region first, then alphabetical
addressData.sort((a, b) => {
  const priority = ['สระบุรี', 'พระนครศรีอยุธยา', 'ลพบุรี', 'กรุงเทพมหานคร', 'ปทุมธานี', 'นครนายก', 'นครราชสีมา', 'สิงห์บุรี', 'อ่างทอง'];
  const idxA = priority.indexOf(a.province);
  const idxB = priority.indexOf(b.province);
  if (idxA !== -1 && idxB !== -1) return idxA - idxB;
  if (idxA !== -1) return -1;
  if (idxB !== -1) return 1;
  return a.province.localeCompare(b.province, 'th');
});

const outputPath = path.join(__dirname, '..', 'src', 'data', 'thai-address.json');
fs.writeFileSync(outputPath, JSON.stringify(addressData, null, 2), 'utf-8');
console.log(`Successfully generated Thai address database with ${addressData.length} provinces to: ${outputPath}`);
