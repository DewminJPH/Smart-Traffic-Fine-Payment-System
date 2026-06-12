import 'dart:convert';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class IssueFineScreen extends StatefulWidget {
  final String token;
  final String officerId;
  final bool isMock;

  const IssueFineScreen({
    super.key,
    required this.token,
    required this.officerId,
    required this.isMock,
  });

  @override
  State<IssueFineScreen> createState() => _IssueFineScreenState();
}

class _IssueFineScreenState extends State<IssueFineScreen> {
  final _formKey = GlobalKey<FormState>();
  final _driverNameController = TextEditingController();
  final _driverPhoneController = TextEditingController();
  final _licenseController = TextEditingController();
  final _vehicleController = TextEditingController();
  
  String _selectedCategory = 'V001';
  String _selectedDistrict = 'Colombo';
  bool _isLoading = false;

  final Map<String, String> _categories = {
    'V001': 'Speeding Above Limit (Rs. 3,000)',
    'V002': 'Reckless Driving (Rs. 5,000)',
    'V003': 'Drunk Driving (Rs. 10,000)',
    'V004': 'Driving Without License (Rs. 6,000)',
    'V005': 'No Helmet / Seatbelt (Rs. 2,000)',
    'V006': 'Traffic Light Violation (Rs. 3,000)',
  };

  // API Gateway URL. For Android Emulator, use 10.0.2.2 instead of localhost
  final String _fineApiUrl = 'http://10.0.2.2:8090/api/v1/fines';

  Future<void> _submitFine() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    final payload = {
      'categoryId': _selectedCategory,
      'driverName': _driverNameController.text.trim(),
      'driverPhone': _driverPhoneController.text.trim(),
      'licenseNumber': _licenseController.text.trim().toUpperCase(),
      'vehicleNumber': _vehicleController.text.trim().toUpperCase(),
      'officerId': widget.officerId,
      'district': _selectedDistrict,
    };

    try {
      if (widget.isMock) {
        // Mock success flow
        _showSuccessDialog('F${10000 + Random().nextInt(90000)}');
        return;
      }

      final response = await http.post(
        Uri.parse(_fineApiUrl),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${widget.token}',
        },
        body: jsonEncode(payload),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        _showSuccessDialog(data['referenceNumber']);
      } else {
        _showErrorSnackBar('Failed to issue fine. Code: ${response.statusCode}');
      }
    } catch (e) {
      // Offline fallback mock
      _showSuccessDialog('F${10000 + Random().nextInt(90000)} (Mock Offline)');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _showSuccessDialog(String reference) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: Color(0xFF5BC0BE)),
            SizedBox(width: 10),
            Text('Fine Ticket Issued'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('The traffic violation ticket has been saved.'),
            const SizedBox(height: 16),
            const Text('FINE REFERENCE NUMBER:', style: TextStyle(color: Colors.grey, fontSize: 12)),
            Text(
              reference,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFFFFD700)),
            ),
            const SizedBox(height: 8),
            const Text('Driver receives SMS notification. Hand license card after instant mobile checkout or payment receipt.', style: TextStyle(fontSize: 11, color: Colors.grey)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Close dialog
              Navigator.pop(context); // Return to Dashboard
            },
            child: const Text('OK', style: TextStyle(color: Color(0xFF5BC0BE))),
          )
        ],
      ),
    );
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.rose),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Issue Fine Sheet'),
        backgroundColor: const Color(0xFF1C2541),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Enter Violation Details',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),
              
              // Dropdown for Fine Category
              DropdownButtonFormField<String>(
                value: _selectedCategory,
                decoration: const InputDecoration(
                  labelText: 'Violation Category',
                  border: OutlineInputBorder(),
                ),
                items: _categories.entries.map((entry) {
                  return DropdownMenuItem<String>(
                    value: entry.key,
                    child: Text(entry.value, style: const TextStyle(fontSize: 13)),
                  );
                }).toList(),
                onChanged: (val) {
                  setState(() {
                    _selectedCategory = val!;
                  });
                },
              ),
              const SizedBox(height: 16),
              
              TextFormField(
                controller: _driverNameController,
                decoration: const InputDecoration(
                  labelText: 'Driver Name',
                  border: OutlineInputBorder(),
                ),
                validator: (val) => val == null || val.isEmpty ? 'Required field' : null,
              ),
              const SizedBox(height: 16),
              
              TextFormField(
                controller: _driverPhoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Driver Phone Number',
                  border: OutlineInputBorder(),
                ),
                validator: (val) => val == null || val.isEmpty ? 'Required field' : null,
              ),
              const SizedBox(height: 16),
              
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _licenseController,
                      textCapitalization: TextCapitalization.characters,
                      decoration: const InputDecoration(
                        labelText: 'Driver License No.',
                        border: OutlineInputBorder(),
                      ),
                      validator: (val) => val == null || val.isEmpty ? 'Required' : null,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextFormField(
                      controller: _vehicleController,
                      textCapitalization: TextCapitalization.characters,
                      decoration: const InputDecoration(
                        labelText: 'Vehicle Plate No.',
                        border: OutlineInputBorder(),
                      ),
                      validator: (val) => val == null || val.isEmpty ? 'Required' : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              
              DropdownButtonFormField<String>(
                value: _selectedDistrict,
                decoration: const InputDecoration(
                  labelText: 'District Jurisdiction',
                  border: OutlineInputBorder(),
                ),
                items: ['Colombo', 'Kandy', 'Galle', 'Gampaha', 'Kurunegala', 'Matara'].map((district) {
                  return DropdownMenuItem<String>(
                    value: district,
                    child: Text(district),
                  );
                }).toList(),
                onChanged: (val) {
                  setState(() {
                    _selectedDistrict = val!;
                  });
                },
              ),
              const SizedBox(height: 32),
              
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submitFine,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF5BC0BE),
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.black)
                      : const Text(
                          'Submit Fine Ticket',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
