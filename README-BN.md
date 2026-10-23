# COPOXJR iOS App Library — প্রাথমিক ওয়েবসাইট

এটি AppleJr.net-এর মতো পরিষ্কার, Apple-inspired layout-সহ একটি **starter prototype**। এটি কোনো অফিসিয়াল Apple/AppleJr পণ্য নয়।

## চালু করা
1. ZIP ফাইলটি iPhone-এর Files অ্যাপে Extract করুন।
2. `index.html` ফাইলটি Safari-তে খুলে ডিজাইন দেখুন (কিছু iOS সেটআপে লোকাল ফাইলের JavaScript সীমিত হতে পারে)।
3. অনলাইনে দিতে হলে ফাইলগুলো GitHub repository-তে আপলোড করে static hosting চালু করুন।

## গুরুত্বপূর্ণ সীমাবদ্ধতা
- Admin panel এখন **শুধু demo**। এতে secure login নেই; তথ্য কেবল একই browser-এর `localStorage`-এ থাকে।
- IPA upload field/backend এখনো যুক্ত নেই। Download link হিসেবে URL দেওয়া যায়, কিন্তু প্রকৃত IPA ফাইল আলাদা file-storage service-এ রাখতে হবে।
- Production-ready IPA upload/download এবং নিরাপদ admin panel-এর জন্য server/API, authentication, database, file storage এবং upload-size limits দরকার। GitHub Pages একা private admin login বা বড় IPA ফাইলের storage নয়।
- কোনো অ্যাপের IPA বিতরণের আগে সেটি বিতরণ করার অধিকার আছে কি না নিশ্চিত করুন। এই সাইট অ্যাপ sign করে না এবং iOS security bypass করে না।

## পরবর্তী ধাপ
ডোমেইন `copoxjr.bbroot.com` কোন hosting/provider-এর, এবং সেখানে DNS/custom-domain settings আছে কি না যাচাই করতে হবে। এরপর live backend/storage যোগ করা যাবে।
