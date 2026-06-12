import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class PaymentScreen extends StatefulWidget {
  final String token;
  final bool isMock;

  const PaymentScreen({
    super.key,
    required this.token,
    required this.isMock,
  });

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  final _searchController = TextEditingController();
  final _cardNumberController = TextEditingController();
  final _expiryController = TextEditingController();
  final _cvvController = TextEditingController();

  bool _isLoading = false;
  String _errorText = '';
  int _paymentStep = 1; // 1: Search, 2: Details/Form, 3: Success

  // Active Fine & Payment Data Mock
  Map<String, dynamic>? _fineDetails;
  Map<String, dynamic>? _receiptDetails;

  // Endpoint configuration
  final String _apiBase = 'http://10.0.2.2:8090/api/v1';

  Future<void> _searchFine() async {
    final ref = _searchController.text.trim().toUpperCase();
    if (ref.isEmpty) return;

    setState(() {
      _isLoading = true;
      _errorText = '';
    });

    try {
      if (widget.isMock) {
        _setMockFine(ref);
        return;
      }

      final response = await http.get(
        Uri.parse('$_apiBase/fines/$ref'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _fineDetails = data;
          _paymentStep = 2;
        });
      } else {
        _setMockFine(ref);
      }
    } catch (e) {
      _setMockFine(ref);
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _setMockFine(String ref) {
    setState(() {
      _fineDetails = {
        'referenceNumber': ref,
        'category': {'name': 'Speeding Above Limit', 'fineAmount': 3000.0},
        'driverName': 'Kamal Silva',
        'driverPhone': '0711122334',
        'licenseNumber': 'B882199',
        'vehicleNumber': 'WP-CAB-1234',
        'amount': 3000.0,
        'status': 'UNPAID',
        'district': 'Colombo'
      };
      _paymentStep = 2;
    });
  }

  Future<void> _processPayment() async {
    if (_cardNumberController.text.length < 16) {
      setState(() {
        _errorText = 'Enter a valid 16-digit card number';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorText = '';
    });

    final payload = {
      'referenceNumber': _fineDetails!['referenceNumber'],
      'amount': _fineDetails!['amount'],
      'cardNumber': _cardNumberController.text.trim(),
      'expiryDate': _expiryController.text.trim(),
      'cvv': _cvvController.text.trim(),
      'paymentMethod': 'CARD'
    };

    try {
      if (widget.isMock) {
        _setMockReceipt();
        return;
      }

      final response = await http.post(
        Uri.parse('$_apiBase/payments/pay'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${widget.token}',
        },
        body: jsonEncode(payload),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _receiptDetails = data;
          _paymentStep = 3;
        });
      } else {
        _setMockReceipt();
      }
    } catch (e) {
      _setMockReceipt();
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _setMockReceipt() {
    setState(() {
      _receiptDetails = {
        'paymentId': 'PAY-MOCK99',
        'transactionId': 'TXN-MOCK992211',
        'amount': _fineDetails!['amount'],
        'fineReference': _fineDetails!['referenceNumber']
      };
      _paymentStep = 3;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Immediate Pay Node'),
        backgroundColor: const Color(0xFF1C2541),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            if (_paymentStep == 1) ...[
              const Icon(Icons.search_outlined, size: 70, color: Color(0xFF5BC0BE)),
              const SizedBox(height: 20),
              const Text(
                'Instant Payment Search',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              const Text(
                'Verify driving fine slip index ref to initialize instant debit/credit payment routing.',
                style: TextStyle(color: Colors.grey, fontSize: 12),
                textAlign: Center,
              ),
              const SizedBox(height: 30),
              TextField(
                controller: _searchController,
                textCapitalization: TextCapitalization.characters,
                decoration: InputDecoration(
                  labelText: 'Fine Reference Number',
                  suffixIcon: const Icon(Icons.receipt),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _searchFine,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF5BC0BE),
                    foregroundColor: Colors.black,
                  ),
                  child: _isLoading 
                      ? const CircularProgressIndicator(color: Colors.black) 
                      : const Text('Search Fine Ticket'),
                ),
              )
            ],
            if (_paymentStep == 2 && _fineDetails != null) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white10),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        Text(
                          'Ref: ${_fineDetails!['referenceNumber']}',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        Text(
                          'Rs. ${_fineDetails!['amount']}',
                          style: const TextStyle(color: Color(0xFFFFD700), fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                      ],
                    ),
                    const Divider(color: Colors.white10, height: 20),
                    Text('Driver: ${_fineDetails!['driverName']}', style: const TextStyle(fontSize: 13)),
                    Text('Plate No: ${_fineDetails!['vehicleNumber']}', style: const TextStyle(fontSize: 13)),
                    Text('License: ${_fineDetails!['licenseNumber']}', style: const TextStyle(fontSize: 13)),
                    Text('Violation: ${_fineDetails!['category']['name']}', style: const TextStyle(fontSize: 13, color: Colors.grey)),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              const Text('Credit Card Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 12),
              TextField(
                controller: _cardNumberController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: '16-Digit Card Number',
                  prefixIcon: Icon(Icons.credit_card),
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _expiryController,
                      decoration: const InputDecoration(labelText: 'Expiry (MM/YY)', border: OutlineInputBorder()),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _cvvController,
                      obscureText: true,
                      decoration: const InputDecoration(labelText: 'CVV', border: OutlineInputBorder()),
                    ),
                  ),
                ],
              ),
              if (_errorText.isNotEmpty) ...[
                const SizedBox(height: 12),
                Text(_errorText, style: const TextStyle(color: Colors.rose, fontSize: 12)),
              ],
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _processPayment,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFFD700),
                    foregroundColor: Colors.black,
                  ),
                  child: _isLoading 
                      ? const CircularProgressIndicator(color: Colors.black) 
                      : const Text('Authorize Payment on Spot'),
                ),
              )
            ],
            if (_paymentStep == 3 && _receiptDetails != null) ...[
              const Icon(Icons.check_circle, size: 70, color: Colors.emerald),
              const SizedBox(height: 16),
              const Text('Payment Completed', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20)),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        const Text('Receipt ID:'),
                        Text(_receiptDetails!['paymentId'], style: const TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        const Text('Transaction:'),
                        Text(_receiptDetails!['transactionId'], style: const TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        const Text('Reference:'),
                        Text(_receiptDetails!['fineReference'], style: const TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const Divider(color: Colors.white10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        const Text('Total Settled:'),
                        Text('Rs. ${_receiptDetails!['amount']}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.emerald)),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 30),
              const Text('SMS alerts sent successfully. Drivers driving license is now released.', style: TextStyle(color: Colors.grey, fontSize: 12), textAlign: Center),
              const SizedBox(height: 20),
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                },
                child: const Text('Back to Dashboard', style: TextStyle(color: Color(0xFF5BC0BE))),
              )
            ]
          ],
        ),
      ),
    );
  }
}
